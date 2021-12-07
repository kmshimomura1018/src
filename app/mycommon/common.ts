import { ValidatorFn, AbstractControl } from "@angular/forms";

export class Common {
  constructor() {

  }

  public ishankaku(str) {
    if (str != null) {
      return str.match(/^[a-zA-Z0-9!-/:-@¥[-`{-~]+$/);
    } else {
      return false;
    }
  }

  // 数値か判断して文字列ならばnullを返す
  public isnumber(num: string) {
    if (num === '') { return 0; }  // 空白を「無し」としてOKとする
    return ((n : number) => isNaN(n) ? null : n)(Number(num));
  }

  // 不明: in_num に正しい値が入っていても falseになる
  // 　　　⇒　関数内で同じ文字列を定義すればOK????
  /*
  public isnumber(in_num: string) {
    // チェック条件パターン
    var pattern = /^[-]?([1-9]\d*|0)(\.\d+)?$/;
    console.log(pattern.test(in_num));
    // 数値チェック
    return (pattern.test(in_num) ? Number(in_num) : null);
  }
  */

  public isvalid(obj: any) {
    if (obj !== null && obj !== undefined) {
      return true;
    }
    return false;
  }

  public isvalid_NaN(obj: number) {
    if (obj !== null && obj !== undefined && !isNaN(obj)) {
      return true;
    }
    return false;    
  }

  public isvalid_tmstr(
      year: number,
      mon: number,
      day: number,
      hour: number,
      min: number,
      sec: number,
      mill: number = 0) {
      
    let stat = false;
    if (isNaN(year) || year < 1970) return stat;
    if (isNaN(mon) || !(1 <= mon && mon <= 12)) return stat;
    if (isNaN(day) || !(1 <= day && day <= 31)) return stat;
    if (isNaN(hour) || !(0 <= hour && hour <= 60)) return stat;
    if (isNaN(min) || !(0 <= min && min <= 60)) return stat;
    if (isNaN(sec) || !(0 <= sec && sec <= 60)) return stat;
    if (isNaN(mill) || !(0 <= mill && mill <= 1000)) return stat;

    return true;
  }

  public isinteger(str) {
    let ret = Number.isInteger(parseFloat(str));
    return ret;
  }
}

export function InputDataValidator(): ValidatorFn {
  let cmn = new Common();
  return (control: AbstractControl): {[key: string]: any} | null => {
    const d = cmn.isnumber(control.value) === null ? false : true;
    return !d ? {'InputData': {value: control.value}} : null;
  };
}

export function InputHankakuStrDataValidator(): ValidatorFn {
  let cmn = new Common();
  return (control: AbstractControl): {[key: string]: any} | null => {
    const d = control !== null ? cmn.ishankaku(control.value) : null;
    return !d ? {'InputHankakuStrData': {value: control.value}} : null;
  };
}


