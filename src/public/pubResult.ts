import BasicResult from '../Results/BasicResult';
import ResultManager from '../Results/ResultManager';

export function OK(): BasicResult {
  return ResultManager.OK();
}

export function KO(): BasicResult {
  return ResultManager.KO();
}
