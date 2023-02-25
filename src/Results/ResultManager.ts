import BasicResult from './BasicResult';

export default abstract class ResultManager {
  static OK(): BasicResult {
    return new BasicResult(true);
  }

  static KO(): BasicResult {
    return new BasicResult(false);
  }
}
