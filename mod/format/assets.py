import ctypes, mmap, struct, pathlib, json, sys, os
root=pathlib.Path(__file__).resolve().parent
original=pathlib.Path('pvzge-0.16.24.exe')
class AssetTable:
 def __init__(self,path):
  self.handle=open(path,'rb')
  self.m=mmap.mmap(self.handle.fileno(),0,access=mmap.ACCESS_READ)
  m=self.m
  pe=struct.unpack_from('<I',m,0x3c)[0]
  self.imagebase=struct.unpack_from('<Q',m,pe+48)[0]
  num=struct.unpack_from('<H',m,pe+6)[0]
  sc=pe+24+struct.unpack_from('<H',m,pe+20)[0]
  sections=[]
  for i in range(num):
   name,vs,va,sz,off=struct.unpack_from('<8sIIII',m,sc+40*i)
   sections.append((self.imagebase+va,self.imagebase+va+sz,off))
   if name.rstrip(b'\0')==b'.rdata':self.delta=self.imagebase+va-off
  def offset(addr):
   for lo,hi,off in sections:
    if lo<=addr<hi:return addr-lo+off
   return -1
  key=b'/assets/main/index.js'
  kp=m.find(key); pivot=m.find(struct.pack('<QQ',kp+self.delta,len(key)))
  if pivot<0:raise ValueError('missing key')
  def read(pos):
   if pos<0 or pos+32>len(m):return None
   a,b,c,d=struct.unpack_from('<4Q',m,pos); a=offset(a);c=offset(c)
   if not (0<a<len(m) and 0<b<400 and 0<c<len(m) and 0<d<=len(m)-c and m[a:a+1]==b'/'):return None
   try:key=m[a:a+b].decode('utf-8')
   except UnicodeError:return None
   if '\x00' in key or '..' in pathlib.PurePosixPath(key).parts:raise ValueError(key)
   return key,(c,d,pos)
  lo=pivot
  while read(lo-32):lo-=32
  self.items={}
  while v:=read(lo):
   key,t=v
   if key in self.items:raise ValueError(key)
   self.items[key]=t;lo+=32
 def decompress(self,key):
  import brotli
  start,length,_=self.items[key]
  return brotli.decompress(self.m[start:start+length])
