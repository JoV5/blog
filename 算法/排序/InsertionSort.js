/**
 * 插入排序（insertion sort）由len-1趟排序组成。对于i=1趟到i=len-1趟（pass），插入排序保证从位置0到位置i上的元素为已排序状态。
 * 插入排序利用了这样的事实：位置0到位置i-1上的元素是已排序过的。
 */
function insertionSort(arr, left, right) {
  let i, j, tmp;
  
  typeof left === 'undefined' && (left = 0);
  typeof right === 'undefined' && (right = arr.length - 1);
  
  for (i = left + 1; i <= right; i++) { // 从i = 1开始
    tmp = arr[i]; // 先取出位置i上的元素

    for (j = i; j > left && tmp < arr[j - 1]; j--) { // 选取合适的插入位置
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



/**
 * 折半插入排序（binary insertion sort）是对插入排序算法的一种改进，由于排序算法过程中，就是不断的依次将元素插入前面已排好序的序列中。
 * 由于前半部分为已排好序的数列，这样我们不用按顺序依次寻找插入点，可以采用折半查找的方法来加快寻找插入点的速度。
 * 
 * 折半插入排序算法是一种稳定的排序算法，比直接插入算法明显减少了关键字之间比较的次数，因此速度比直接插入排序算法快，
 * 但记录移动的次数没有变，所以折半插入排序算法的时间复杂度仍然为O(n^2)，与直接插入排序算法相同。附加空间O(1)。
 * 折半查找只是减少了比较次数，但是元素的移动次数不变，所以时间复杂度为O(n^2)是正确的！
 */
function insertionSort2(arr) {
  let i, j, len, tmp, left, right, middle;
  for (i = 1, len = arr.length; i < len; i++) {
    tmp = arr[i];
    left = 0;
    right = i - 1;

    while (left <= right) {
      middle = (left + right) >> 1;

      if (arr[middle] <= tmp) {
        left = middle + 1;
      } else {
        right = middle - 1;
      }
    }

    for (j = i; j > left; j--) {
      arr[j] = arr[j - 1];
    }

    arr[left] = tmp;
  }

  return arr;
}