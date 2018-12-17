function methodThatReturnsAPromise(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Processing ${id}`);
      resolve(id);
    }, 1000);
  });
}

let list = [];
let result = [1,2,3].reduce( (accumulatorPromise, nextID) => {
  return accumulatorPromise.then(async () => {
    const element = await methodThatReturnsAPromise(nextID);
    list.push(element);
    return element;
  });
}, Promise.resolve());

(async () => {
  const res = await result;
  console.log('FINAL RESULT: ', list);
})();