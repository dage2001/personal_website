/** LTspice files may be UTF-8, UTF-16 or legacy Windows-1252. */
export function decodeSpiceText(buffer) {
  const bytes=new Uint8Array(buffer);
  if((bytes[0]===0xff&&bytes[1]===0xfe)||bytes[1]===0)return new TextDecoder('utf-16le').decode(bytes);
  if((bytes[0]===0xfe&&bytes[1]===0xff)||bytes[0]===0)return new TextDecoder('utf-16be').decode(bytes);
  try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{return new TextDecoder('windows-1252').decode(bytes);}
}
export async function readSpiceFile(file){return decodeSpiceText(await file.arrayBuffer());}
