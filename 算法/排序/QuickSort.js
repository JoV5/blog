/**
 * 快速排序是一种分治的递归算法。将数组S排序的基本算法由下列简单的四步组成：
 * 1.如果S中元素个数是0或1，则返回。
 * 2.取S中任一元素，称之为枢纽元（pivot）
 * 3.将S - {v}（S中其余元素）分成两个不相交的集合：S1 = {x ∈ S - {v} | x ≤ v}和S2 = {x ∈ S - {v} | x ≥ v}。
 * 4.返回{quicksort(S1)后，继随v，继而quicksort(S2)} 
 */