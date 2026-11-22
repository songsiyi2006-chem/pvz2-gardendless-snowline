from pathlib import Path
import argparse
import ctypes
import json
import mmap
import os
import shutil
import struct
import sys

from assets import AssetTable, original, root

def align(value, multiple):
    return ((value + multiple - 1) // multiple) * multiple

def compress(raw):
    import brotli
    return brotli.compress(raw, mode=brotli.MODE_GENERIC, quality=8, lgwin=22)

def read_sections(binary, start, count):
    return [struct.unpack_from('<8sIIII', binary, start + i*40) for i in range(count)]

def add_assets(source, replacements, dest):
    if source.resolve() == dest.resolve(): raise ValueError('Use a new output file')
    files = { '/'+p.relative_to(replacements).as_posix():p for p in replacements.rglob('*') if p.is_file() }
    if not files: raise ValueError('No replacement files in '+str(replacements))
    table = AssetTable(source)
    missing = sorted(set(files).difference(table.items))
    if missing: raise ValueError(f'Replacement must use an existing resource name: {missing}')
    blocks = {k:compress(v.read_bytes()) for k,v in sorted(files.items())}
    m = table.m
    pe=struct.unpack_from('<I',m,0x3c)[0]
    if m[pe:pe+4] != b'PE\x00\x00':raise ValueError('Missing PE header')
    opt=pe+24
    if struct.unpack_from('<H',m,opt)[0] != 0x20b:raise ValueError('Expected PE32+')
    n=struct.unpack_from('<H',m,pe+6)[0]
    sec=opt+struct.unpack_from('<H',m,pe+20)[0]
    sections=read_sections(m,sec,n)
    sh=sec+40*n
    v_align,f_align=struct.unpack_from('<II',m,opt+32)
    if sh+40>min(s[4] for s in sections if s[3]) or any(m[sh:sh+40]):
        raise ValueError('Missing room for section header')
    cert=struct.unpack_from('<II',m,opt+112+4*8)
    if cert != (0,0):raise ValueError('Source contains Authenticode certificate')
    new_va=align(max(s[2]+max(s[1],s[3]) for s in sections),v_align)
    new_raw=align(len(m),f_align)
    # Resource table pointers are absolute addresses. The linker emitted a base
    # relocation for each one, and the existing relocation remains in place.
    reloc=next(s for s in sections if s[0].rstrip(b'\0')==b'.reloc')
    reloc_rva,reloc_size=struct.unpack_from('<II',m,opt+112+5*8)
    cursor=reloc[4]+(reloc_rva-reloc[2]);end=cursor+reloc_size
    relocations=set()
    while cursor<end:
        page,bsz=struct.unpack_from('<II',m,cursor)
        if bsz<8 or cursor+bsz>end:raise ValueError('Invalid relocation block')
        for t in struct.iter_unpack('<H',m[cursor+8:cursor+bsz]):
            if t[0] >> 12 == 10: relocations.add(page+(t[0]&4095))
        cursor+=bsz
    size=sum(len(b) for b in blocks.values())
    rawsize=align(size,f_align)
    image_size=align(new_va+size,v_align)
    dest.parent.mkdir(parents=True,exist_ok=True)
    temp=dest.with_name(dest.name+'.building')
    if temp.resolve()==source.resolve():raise ValueError('Invalid output')
    try:
        shutil.copyfile(source,temp)
        with open(temp,'r+b') as f:
            f.truncate(new_raw+rawsize)
            with mmap.mmap(f.fileno(),0) as out:
                out[sh:sh+40]=struct.pack('<8sIIIIIIHHI', b'.garden', size,new_va,rawsize,new_raw,0,0,0,0,0x40000040)
                struct.pack_into('<H',out,pe+6,n+1)
                struct.pack_into('<I',out,opt+8,struct.unpack_from('<I',m,opt+8)[0]+rawsize)
                struct.pack_into('<I',out,opt+56,image_size)
                struct.pack_into('<I',out,opt+64,0)
                cursor=0
                for k,b in blocks.items():
                    _,_,p=table.items[k]
                    rva=p+16+(table.delta-table.imagebase)
                    if rva not in relocations:raise ValueError('Missing relocation for '+k)
                    struct.pack_into('<QQ',out,p+16,table.imagebase+new_va+cursor,len(b))
                    out[new_raw+cursor:new_raw+cursor+len(b)]=b
                    cursor+=len(b)
        # Re-read the actual native entry table, including its new section.
        check=AssetTable(temp)
        try:
            if set(check.items)!=set(table.items):raise ValueError('Asset inventory changed unexpectedly')
            for key,new in files.items():
                c,d,_=check.items[key]
                if not(c>=new_raw and c+d<=new_raw+size):raise ValueError(key)
                if check.decompress(key) != new.read_bytes():raise ValueError('Round-trip mismatch: '+key)
            for key in table.items.keys()-files.keys():
                if table.items[key]!=check.items[key]:raise ValueError('Unexpected changed resource: '+key)
        finally:
            check.m.close();check.handle.close()
        os.replace(temp,dest)
    finally:
        table.m.close();table.handle.close()
        if temp.exists():temp.unlink()
    print(json.dumps({'file':str(dest),'size':dest.stat().st_size,'original_entries':len(table.items),'verified_replacements':list(blocks)},ensure_ascii=False))

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('replacements',type=Path)
    p.add_argument('output',type=Path)
    p.add_argument('--source',type=Path,default=original)
    a=p.parse_args()
    add_assets(a.source,a.replacements,a.output)
