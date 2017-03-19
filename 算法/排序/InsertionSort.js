/**
 * 插入排序（insertion sort）由N-1趟排序组成。对于P=1趟到P=N-1趟（pass），插入排序保证从位置0到位置P上的元素为已排序状态。
 * 插入排序利用了这样的事实：位置0到位置P-1上的元素是已排序过的。
 */
function insertionSort(arr) {
  let N = arr.length,
    P, j;
  for (P = 1; P < N; P++) { // 从P = 1开始
    let tmp = arr[P]; // 先取出位置P上的元素

    for (j = P; j > 0 && tmp < arr[j - 1]; j--) { // 选取合适的插入位置
      arr[j] = arr[j - 1]; // 向后平移
    }

    arr[j] = tmp; // 插入
  }
  return arr;
}

/**
 * N个互异数的数组平均逆序数是N(N-1)/4
 */

/**
 * 通过交换相邻元素进行排序的任何算法平均需要Ω(N²)时间
 */

function insertionSort2(arr) {
  for (let i = 1, len = arr.length; i < len; i++) {
    let tmp = arr[i];
    let left = 0, right = i - 1;

    while (left < right) {
      let middle = parseInt((left + right) / 2);

      if (arr[middle] < tmp) {
        left = middle + 1;
      } else if (arr[middle] > tmp) {
        right = middle - 1;
      } else {
        left = right = middle;
      }

      for (let j = i; j > left; j--) {
        arr[j] = arr[j - 1];
      }
    }
    
    arr[left] = tmp;
  }

  return arr;
}