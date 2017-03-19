function swap(arr, i, j) {
  let tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function bubbleSort1(arr) {
  for (let i = arr.length; i--;) {
    for (let j = 0; j < i; j++) { // 将最大的交换到末尾
      arr[j] > arr[j + 1] && swap(arr, j, j + 1);
    }
  }
  return arr;
}

function bubbleSort2(arr) {
  for (let i = arr.length; i--;) {
    let swaped = false; // 加入一个标记位，若这一趟未曾交换，则表示已排好序，可以直接退出循环了

    for (let j = 0; j < i; j++) {
      arr[j] > arr[j + 1] && (swaped = true) && swap(arr, j, j + 1);
    }

    if (!swaped) {
      break;
    }
  }
  return arr;
}

function bubbleSort3(arr) {
  for (let i = arr.length; i--;) {
    let pos = 0; // 加入一个标记位，记录最后一次交换的位置，下次只需循环到该位置，对于部分已排序数组效率较高

    for (let j = 0; j < i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
        pos = j + 1;
      }
    }

    i = pos;
  }
  return arr;
}

/**
 * 鸡尾酒排序等于是冒泡排序的轻微变形。不同的地方在于从低到高然后从高到低，而冒泡排序则仅从低到高去比较序列里的每个元素。
 * 他可以得到比冒泡排序稍微好一点的效能，原因是冒泡排序只从一个方向进行比对（由低到高），每次循环只移动一个项目。
 * 以序列(2,3,4,5,1)为例，鸡尾酒排序只需要访问一次序列就可以完成排序，但如果使用冒泡排序则需要四次。但是在乱数序列的状态下，鸡尾酒排序与冒泡排序的效率都很差劲。
 * @param arr
 * @returns {*}
 */
function bubbleSort4(arr) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left < right) {
    let swaped = false;
    
    for (let i = left; i < right; i++) {
      if (arr[i] > arr[i + 1]) {
        swap(arr, i, i + 1);
        swaped = true;
      }
    }
    
    if (!swaped) {
      break;
    } else {
      swaped = false;
    }
    
    right--;
    
    for (let j = right; j > left; j--) {
      if (arr[j - 1] > arr[j]) {
        swap(arr, j - 1, j);
        swaped = true;
      }
    }
    
    if (!swaped) {
      break;
    }
    
    left++;
  }

  return arr;
}