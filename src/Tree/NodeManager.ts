import SE_BRANCH from './Branch';
import SE_LEAF from './Leaf';
import SE_NODE from './Node';
import SE_ROOT from './Root';
import SE_SENTINEL from './Sentinel';

type NodeFilter<T extends SE_NODE> = (node: T) => boolean;
type NodeExec<T extends SE_NODE> = (node: T, depth: number) => Promise<void>;
// Interface defining a node filter and action to be applied during the depth-first search traversal.
interface NodeFilterExec<T extends SE_NODE> {
  filter?: NodeFilter<T>; // Optional filter function to apply to the node.
  exec: NodeExec<T>; // Required action function to apply to the node.
}

// Function to execute a node filter and action on a given node.
async function executeNFE(node: SE_NODE, depth: number, nfe?: NodeFilterExec<any>) {
  // If a filter is present and evaluates to true for the node, execute the action.
  if (nfe && (!nfe.filter || nfe.filter(node))) {
    await nfe.exec(node, depth);
  }
}

export default class NodeManager {
  // Function to determine if a given parent node has a child leaf node with the specified identifier.
  public static localHasLeaf(parent: SE_SENTINEL | SE_BRANCH, leaf: SE_LEAF): boolean {
    return parent.nodes.some((child) => child instanceof SE_LEAF && child.identifier === leaf.identifier);
  }

  // Function to determine if a given parent node has a child branch node with the specified identifier.
  public static localHasBranch(parent: SE_SENTINEL | SE_BRANCH, identifier: string): boolean {
    return this.localBranchCount(parent, identifier) > 0;
  }

  // Function to count the number of child branch nodes with the specified identifier for a given parent node.
  public static localBranchCount(parent: SE_SENTINEL | SE_BRANCH, identifier: string): number {
    return parent.nodes.reduce((acc, cur) => {
      if (cur instanceof SE_BRANCH && cur.identifier === identifier) {
        return acc + 1;
      }
      return acc;
    }, 0);
  }

  public static async wayTraversal(
    dest: SE_NODE,
    nodeFilterExecs: { prefixe?: NodeFilterExec<SE_NODE>; suffixe?: NodeFilterExec<SE_NODE> },
  ): Promise<void> {
    const way = dest.getWay().concat([dest]);
    const reverseWay: SE_NODE[] = [];
    let depth = 0;
    while (way.length !== 0) {
      const node = way.splice(0, 1)[0];
      reverseWay.unshift(node);
      await executeNFE(node, depth, nodeFilterExecs.prefixe);
      depth += 1;
    }
    while (reverseWay.length !== 0) {
      depth -= 1;
      const node = reverseWay.splice(0, 1)[0];
      await executeNFE(node, depth, nodeFilterExecs.suffixe);
    }
  }

  // Function to perform a depth-first search traversal of the node tree with the given node as the root, applying the specified filters and actions.
  public static async dfs(
    node: SE_NODE,
    nodeFilterExecs: {
      prefixe?: NodeFilterExec<SE_LEAF>;
      infixe?: NodeFilterExec<SE_LEAF>;
      suffixe?: NodeFilterExec<SE_LEAF>;
    },
    startingDepth?: number,
  ): Promise<void>;
  public static async dfs(
    node: SE_NODE,
    nodeFilterExecs: {
      prefixe?: NodeFilterExec<SE_NODE>;
      infixe?: NodeFilterExec<SE_NODE>;
      suffixe?: NodeFilterExec<SE_NODE>;
    },
    startingDepth = 0,
  ): Promise<void> {
    // If the current node is a leaf node, execute all specified filters and actions.
    if (node instanceof SE_LEAF) {
      await executeNFE(node, startingDepth, nodeFilterExecs.prefixe);
      await executeNFE(node, startingDepth, nodeFilterExecs.infixe);
      await executeNFE(node, startingDepth, nodeFilterExecs.suffixe);
      return;
    }
    // If the current node is not a leaf node, obtain its child nodes.
    let nodes: SE_NODE[] = [];
    if (node instanceof SE_ROOT) {
      nodes = node.getSentinels();
    } else if (node instanceof SE_BRANCH || node instanceof SE_SENTINEL) {
      nodes = node.nodes;
    }

    // Execute the specified prefix filters and actions.
    await executeNFE(node, startingDepth, nodeFilterExecs.prefixe);
    // Recursively traverse the child nodes and execute the specified infix filters and actions.
    for (const child of nodes) {
      await this.dfs(child, nodeFilterExecs, startingDepth + 1);
      await executeNFE(node, startingDepth, nodeFilterExecs.infixe);
    }
    // Execute the specified suffix filters and actions.
    await executeNFE(node, startingDepth, nodeFilterExecs.suffixe);
  }

  public static async forEachLeaves(node: SE_NODE, exec: NodeExec<SE_LEAF>): Promise<void> {
    await this.dfs(node, {
      prefixe: {
        filter: (node) => node.type === 'leaf',
        exec,
      },
    });
  }

  public static async getLeaves(parent: SE_NODE): Promise<SE_LEAF[]> {
    const leaves: SE_LEAF[] = [];
    await this.forEachLeaves(parent, async (node) => {
      leaves.push(node);
    });
    return leaves;
  }

  public static async getLeaf(parent: SE_NODE, identifier: string): Promise<SE_LEAF | undefined> {
    let leaves = await this.getLeaves(parent);
    leaves = leaves.filter((leaf) => leaf.fullIdentifier === identifier);
    return leaves.pop();
  }

  public static async getLeavesCount(parent: SE_NODE): Promise<number> {
    return (await this.getLeaves(parent)).length;
  }

  public static async hasLeaf(parent: SE_NODE, leaf: SE_LEAF): Promise<boolean> {
    let finded = false;
    await this.forEachLeaves(parent, async (node) => {
      if (leaf.equals(node)) {
        finded = true;
      }
    });
    return finded;
  }

  public static async showTree(parent: SE_NODE) {
    const indent = (size: number) => ''.padStart(size, '  ');
    await this.dfs(parent, {
      prefixe: {
        exec: async (node, depth) => {
          console.log(`${indent(depth * 2)}${node.describe()}`);
        },
      },
    });
  }
}
