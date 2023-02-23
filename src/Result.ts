export default class Result {
  private _payload: any;

  public get payload() {
    return this._payload;
  }

  public set payload(payload: any) {
    this._payload = payload;
  }
}
