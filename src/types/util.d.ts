export type MyDeepPartial<T> = {
  [P in keyof T]?: MyDeepPartial<T[P]>;
};
