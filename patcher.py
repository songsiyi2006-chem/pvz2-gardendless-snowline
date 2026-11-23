"""Build public beta 0.2 from the player's own Windows copy of Gardendless."""
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
DEFAULT_OUTPUT = 'Snowline-Garden-v0.2.exe'
HOME_DIR = Path(sys.executable if getattr(sys,'frozen',False) else __file__).resolve().parent

def install(base, output=None):
    mod = HOME_DIR / 'mod'
    source, destination = base.resolve(), output.resolve() if output is not None else None
    if destination is not None and (source == destination or destination.exists()):
        raise ValueError('请选择一个尚不存在的新文件。Choose a new output file. Your original will be kept.')
    if not source.is_file() or source.stat().st_size < 65536:
        raise ValueError('请选择支持的 Windows 原版游戏。Select a supported Windows game executable.')
    with source.open('rb') as incoming:
        if incoming.read(2)!=b'MZ':raise ValueError('Windows PE executable expected.')
    if not (mod/'garden/assemble.py').is_file():
        raise FileNotFoundError('请将压缩包全部解压并保留 mod 文件夹。Extract the entire archive including its mod folder.')
    sys.path[:0] = [str(HOME_DIR),str(mod/'garden'),str(mod/'format'),str(mod/'installed')]
    import assemble, fixed_rank
    import compatibility
    from assets import AssetTable
    from build import add_assets
    table = AssetTable(source)
    try:
        with TemporaryDirectory(prefix='snowline-build-') as tmp:
            mapping=compatibility.detect(table)
            by_installed={actual:canonical for canonical,actual in mapping.items()}
            original=Path(tmp)/'original'
            def extract(key):
                stripped=key.lstrip('/')
                target=original/by_installed.get(stripped,stripped)
                target.parent.mkdir(parents=True,exist_ok=True)
                raw=table.decompress(key)
                role=by_installed.get(stripped)
                if role==compatibility.MAIN:
                    raw=compatibility.prepare_main(raw.decode('utf8')).encode('utf8')
                elif role==compatibility.PRELOAD:
                    raw=compatibility.prepare_preload(raw.decode('utf8')).encode('utf8')
                target.write_bytes(raw)
                return target
            assets={'/'+p for p in mapping.values()}
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
            assemble.compat_boot=compatibility.rewrite_boot
            portrait=json.loads((mod/'format/portraits.json').read_text('utf8'))['src']
            variants=[k for k in table.items if k.rsplit('.',1)[0]==portrait.rsplit('.',1)[0] and k.lower().endswith(('.png','.webp','.avif','.jpg'))]
            if portrait not in variants and len(variants)!=1:
                raise ValueError('Could not identify the seed portrait texture for this build.')
            assemble.portrait_source=portrait if portrait in variants else variants[0]
            replacements=assemble.build(regenerate=False)
            actual_replacements=Path(tmp)/'installed-changes'
            for changed in replacements.rglob('*'):
                if not changed.is_file():continue
                relative=changed.relative_to(replacements).as_posix()
                installed=mapping.get(relative,relative)
                if '/'+installed not in table.items:raise ValueError('Missing installed resource '+installed)
                final_file=actual_replacements/installed
                final_file.parent.mkdir(parents=True,exist_ok=True)
                changed.replace(final_file)
            if destination is None:
                return 'Compatible hooks / 已匹配全部改版挂载点: '+source.name
            destination.parent.mkdir(parents=True,exist_ok=True)
            # Stage next to the destination for an atomic, no-overwrite rename on Windows.
            with TemporaryDirectory(dir=destination.parent,prefix='.snowline-') as staging:
                built=Path(staging)/DEFAULT_OUTPUT
                add_assets(source,actual_replacements,built)
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
        base=pick_file(False,'选择支持的 Gardendless Windows 版本 / Select a supported base game')
        if not base:return
        target=pick_file(True,'保存独立测试版 / Choose a new output',str(base.parent/DEFAULT_OUTPUT))
        if not target:return
        install(base,target)
        popup(None,'制作完成 / Ready to play\n\n'+str(target),'Snowline Garden 0.2',0x40)
    except Exception as exc:
        popup(None,str(exc),'Snowline Garden 0.2',0x10);raise

if __name__=='__main__':
    if len(sys.argv)==1: gui()
    else:
        parser=argparse.ArgumentParser(description=__doc__)
        parser.add_argument('original',type=Path)
        parser.add_argument('output',type=Path,nargs='?')
        parser.add_argument('--check',action='store_true',help='validate game compatibility without writing an executable')
        parsed=parser.parse_args()
        if parsed.check and parsed.output:parser.error('--check takes no output file')
        if not parsed.check and not parsed.output:parser.error('provide an output file or use --check')
        print(install(parsed.original,parsed.output))
