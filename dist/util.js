"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextTick = nextTick;
function nextTick(fn) {
    setTimeout(fn, 0);
}
