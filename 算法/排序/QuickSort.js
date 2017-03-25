/**
 * 快速排序是一种分治的递归算法。将数组S排序的基本算法由下列简单的四步组成：
 * 1.如果S中元素个数是0或1，则返回。
 * 2.取S中任一元素，称之为枢纽元（pivot）
 * 3.将S - {v}（S中其余元素）分成两个不相交的集合：S1 = {x ∈ S - {v} | x ≤ v}和S2 = {x ∈ S - {v} | x ≥ v}。
 * 4.返回{quicksort(S1)后，继随v，继而quicksort(S2)} 
 */

function swap(arr, i, j) {
  let tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function quickSort(array) {
  // 交换元素位置
  function swap(array, i, k) {
    var temp = array[i];
    array[i] = array[k];
    array[k] = temp;
  }
  // 数组分区，左小右大
  function partition(array, left, right) {
    var storeIndex = left;
    var pivot = array[right]; // 直接选最右边的元素为基准元素
    for (var i = left; i < right; i++) {
      if (array[i] < pivot) {
        swap(array, storeIndex, i);
        storeIndex++; // 交换位置后，storeIndex 自增 1，代表下一个可能要交换的位置
      }
    }
    swap(array, right, storeIndex); // 将基准元素放置到最后的正确位置上
    return storeIndex;
  }
  function sort(array, left, right) {
    if (left > right) {
      return;
    }
    var storeIndex = partition(array, left, right);
    sort(array, left, storeIndex - 1);
    sort(array, storeIndex + 1, right);
  }
  sort(array, 0, array.length - 1);
  return array;
}

function median3(arr, left, right) {
  let center = (left + right) >> 1;
  
  if (arr[left] > arr[center]) {
    swap(arr, left, center);
  }
  if (arr[left] > arr[right]) {
    swap(arr, left, right);
  }
  if (arr[center] > arr[right]) {
    swap(arr, center, right);
  }
  
  swap(arr, center, right - 1);
  
  return arr[right - 1];
}

let  cutoff = 3;

function quickSort2(arr, left, right) {
  let i, j, pivot;
  
  typeof left === 'undefined' && (left = 0);
  typeof right === 'undefined' && (right = arr.length - 1);
  
  if (left + cutoff <= right) {
    pivot = median3(arr, left, right);
    i = left;
    j = right - 1;
    
    for (;;) {
      while (arr[++i] < pivot) {}
      while (arr[--j] > pivot) {}
      if (i < j) {
        swap(arr, i, j);
      } else {
        break;
      }
    }
    
    swap(arr, i, right - 1);
    
    quickSort2(arr, left, i - 1);
    quickSort2(arr, i + 1, right);
  } else {
    insertionSort(arr, left, right);
  }
  
  return arr;
}