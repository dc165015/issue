import { FormControl } from '@angular/forms';
import { FORBIDDEN_NAMES } from 'api/lib/constants';

export class UsernameValidator {

  static forbiddenName(fc: FormControl) {
    const value = fc.value;

    const forbiddenFound = FORBIDDEN_NAMES.find((name: RegExp | string) => {
      return name instanceof RegExp ? name.test(value) : String(value).trim().toLocaleLowerCase() == name;
    });

    return forbiddenFound ? { forbiddenName: { value } } : null;
  }
}
