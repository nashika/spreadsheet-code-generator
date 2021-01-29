import loglevel from "loglevel";

// (<any>window).log = log; TODO: recover?
loglevel.setLevel("trace");
export const logger = loglevel;
