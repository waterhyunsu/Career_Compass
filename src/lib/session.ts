/** Generation token for asynchronous reads and writes owned by a signed-in account. */
export class SessionGate{
 private identity:string|null|undefined=undefined;
 private epoch=0;
 start(identity:string|null,force=false):number|null{
  if(!force&&this.identity===identity)return null;
  this.identity=identity;return ++this.epoch;
 }
 token(){return this.epoch;}
 current(token:number){return this.epoch===token;}
 invalidate(){this.identity=undefined;++this.epoch;}
}
