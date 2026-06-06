(function () {
  "use strict";

  var STORAGE_KEY = "zoes-vet-surgery-data";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readRaw() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  function write(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return clone(data);
  }

  function seed() {
    return write(window.ZoeVetSeed.create());
  }

  function read() {
    var data = readRaw();

    if (!data || data.version !== window.ZoeVetSeed.version) {
      return seed();
    }

    return clone(data);
  }

  function reset() {
    return seed();
  }

  function update(mutator) {
    var data = read();
    mutator(data);
    return write(data);
  }

  window.ZoeVetData = {
    key: STORAGE_KEY,
    read: read,
    reset: reset,
    update: update,
    write: write
  };
}());
