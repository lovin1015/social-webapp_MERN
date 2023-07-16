// [0,1,0,3,12]
// [1,3,12,0,0]

const INPUT = [0, 0, 0, 0, 0, 1, 0, 3, 0, 12];

function solve(input = []) {
  let zeroIndex = input.indexOf(0);
  const totalLength = input.length;
  while (zeroIndex > -1) {
    input.splice(zeroIndex, 1);
    zeroIndex = input.indexOf(0);
  }
  let result = [...input, ...Array(totalLength - input.length).fill(0)];
  console.log(result);
}

solve(INPUT);
