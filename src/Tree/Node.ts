type NodeType = 'root' | 'sentinel' | 'branch' | 'leaf';

abstract class SE_NODE {
  public type: NodeType;
  protected _way: SE_NODE[] = [];
  constructor(type: NodeType) {
    this.type = type;
  }

  public abstract describe(): string;
  public abstract equals(node: SE_NODE): boolean;
  public abstract onAdded(parent: SE_NODE | null): void;
  public getWay(): SE_NODE[] {
    return this._way;
  }
}

export default SE_NODE;
