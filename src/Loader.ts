import fileUrl from 'file-url';
import Builder from './Builder';
import SE_SENTINEL from './Tree/Sentinel';

type Infos = { files: string[] };

export default class Loader {
  private infos: Infos;
  private builder: Builder;

  constructor(infos: Infos, builder: Builder) {
    this.infos = infos;
    this.builder = builder;
  }

  public async load() {
    for (const file of this.infos.files) {
      await this.loadFile(file);
    }
    // after check
    this.builder.checkBuild();
  }

  private async loadFile(file: string) {
    const sentinel = new SE_SENTINEL(file);
    this.builder.insert(sentinel);
    this.builder.moveHeadTo(sentinel);
    require(file);
    this.builder.moveHeadBack();
  }
}
