"""Build public beta 0.1 from the player's own Windows copy of Gardendless."""
from pathlib import Path
from tempfile import TemporaryDirectory
import argparse
import ctypes
import hashlib
import json
import os
import sys

BASE_SHA256 = '02f0bf4dcf17bc6afa09ce8e752ebd162dc6b06555dc981f56693fdb5e172624'
BASE_BYTES = 1211438592
DEFAULT_OUTPUT = 'Snowline-Garden-v0.1.exe'
HOME_DIR = Path(sys.executable if getattr(sys,'frozen',False) else __file__).resolve().parent

def install(base, output):
    mod = HOME_DIR / 'mod'
    source, destination = base.resolve(), output.resolve()
    if source == destination or destination.exists():
        raise ValueError('请选择一个尚不存在的新文件。Choose a new output file. Your original will be kept.')
    if not source.is_file() or source.stat().st_size != BASE_BYTES:
        raise ValueError('需要原始 Windows 0.16.24 EXE。Select the original Windows 0.16.24 executable.')
    with source.open('rb') as incoming:
        if hashlib.file_digest(incoming,'sha256').hexdigest() != BASE_SHA256:
            raise ValueError('原版文件 SHA-256 不匹配。The base SHA-256 does not match the supported release.')
    if not (mod/'garden/assemble.py').is_file():
        raise FileNotFoundError('请将压缩包全部解压并保留 mod 文件夹。Extract the entire archive including its mod folder.')
    sys.path[:0] = [str(mod/'garden'),str(mod/'format'),str(mod/'installed')]
    import assemble, fixed_rank
    from assets import AssetTable
    from build import add_assets
    table = AssetTable(source)
    try:
        with TemporaryDirectory(prefix='snowline-build-') as tmp:
            original=Path(tmp)/'original'
            def extract(key):
                target=original/key.lstrip('/')
                target.parent.mkdir(parents=True,exist_ok=True)
                target.write_bytes(table.decompress(key))
                return target
            assets=set('/'+f for f in (*assemble.fairplay.ASSETS,assemble.speed.ENGINE))
            assets.update(k for k in table.items if k.startswith('/assets/') and k.count('/')==2 and k.endswith('.js'))
            for k in assets:extract(k)
            config_file=extract('/assets/resources/config.json')
            config=json.loads(config_file.read_bytes())
            fixed_rank.ASSETS=config_file.parent
            for i,p in config['paths'].items():
                if p[0].startswith('worldmaps/epic/') or p[0]=='json/Features/ZombieFeatures':
                    direct='/'+fixed_rank.import_path(config,i).relative_to(original).as_posix()
                    if direct in table.items:
                        extract(direct)
                    else:
                        pack=next(k for k,indices in config['packs'].items() if int(i) in indices)
                        extract('/assets/resources/import/'+pack[:2]+'/'+pack+'.json')
            assemble.SOURCE=original
            assemble.REPLACEMENTS=Path(tmp)/'changes'
            replacements=assemble.build(regenerate=False)
            destination.parent.mkdir(parents=True,exist_ok=True)
            # Stage next to the destination for an atomic, no-overwrite rename on Windows.
            with TemporaryDirectory(dir=destination.parent,prefix='.snowline-') as staging:
                built=Path(staging)/DEFAULT_OUTPUT
                add_assets(source,replacements,built)
                if os.name=='nt':os.rename(built,destination)
                else:os.link(built,destination)
    finally:
        table.m.close()
        table.handle.close()
    return destination

def pick_file(save, title, initial=''):
    from ctypes import wintypes as w
    p=ctypes.c_void_p
    class FileDialog(ctypes.Structure):
        _fields_=[('size',w.DWORD),('owner',w.HWND),('instance',p),('filter',w.LPCWSTR),('custom',p),
                  ('customSize',w.DWORD),('filterIndex',w.DWORD),('file',p),('fileChars',w.DWORD),
                  ('titleBuffer',p),('titleSize',w.DWORD),('directory',w.LPCWSTR),('caption',w.LPCWSTR),
                  ('flags',w.DWORD),('fileOffset',w.WORD),('extOffset',w.WORD),('defExt',w.LPCWSTR),
                  ('data',p),('hook',p),('template',p),('reserved',p),('reservedSize',w.DWORD),('flagsEx',w.DWORD)]
    buf=ctypes.create_unicode_buffer(initial,32768)
    dialog=FileDialog(size=ctypes.sizeof(FileDialog),filter='Windows executable (*.exe)\0*.exe\0\0',
                      file=ctypes.addressof(buf),fileChars=len(buf),caption=title,defExt='exe',
                      filterIndex=1,flags=0x80000|0x800|0x8|(0 if save else 0x1000))
    select=ctypes.windll.comdlg32.GetSaveFileNameW if save else ctypes.windll.comdlg32.GetOpenFileNameW
    return Path(buf.value) if select(ctypes.byref(dialog)) else None

def gui():
    popup=ctypes.windll.user32.MessageBoxW
    try:
        base=pick_file(False,'选择原版 Gardendless 0.16.24 / Select original game')
        if not base:return
        target=pick_file(True,'保存独立测试版 / Choose a new output',str(base.parent/DEFAULT_OUTPUT))
        if not target:return
        install(base,target)
        popup(None,'制作完成 / Ready to play\n\n'+str(target),'Snowline Garden 0.1',0x40)
    except Exception as exc:
        popup(None,str(exc),'Snowline Garden 0.1',0x10);raise

if __name__=='__main__':
    if len(sys.argv)==1: gui()
    else:
        parser=argparse.ArgumentParser(description=__doc__)
        parser.add_argument('original',type=Path)
        parser.add_argument('output',type=Path)
        parsed=parser.parse_args()
        print(install(parsed.original,parsed.output))
