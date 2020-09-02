type MapCallback<T = any> = (value: T, index?: number, array?: T[]) => any;
type FirstArgType<T> = T extends (arg: infer A, ...rest: any[]) => any ? A : never;

export const map = <T extends MapCallback>(fn: T) =>
  (arr: FirstArgType<T>[]): Promise<ReturnType<T>[]> =>
    Promise.all(arr.map<ReturnType<T>>(fn));

export const log = (description: string, logValue: boolean = true) =>
  <T extends any>(input: T) => {
    console.log(description);
    if (logValue) console.log(input);
    return input;
  };
