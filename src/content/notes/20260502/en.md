---
title: "20260502"
pubDate: 2026-05-02
description: "Java-2"
category: "Notes"
image: ""
draft: false
slugId: "momo/notes/20260502"
pinTop: 0
---

# Java Learning Notes Continued

::github{repo="Snailclimb/JavaGuide"}

## Map

### Differences Between HashMap and HashTable

- Thread safety: HashMap is not thread-safe, while HashTable is thread-safe.
- Efficiency: Due to thread safety, HashMap is slightly more efficient than HashTable. In addition, HashTable has basically been deprecated and should not be used in code.
- Support for Null key and Null value: HashMap can store null keys and values, but there can be only one null key, while there can be multiple null values; Hashtable does not allow null keys or null values, otherwise it will throw a NullPointerException.
- If the initial capacity is not specified when creating the collection, the default initial size of HashTable is 11, and it expands to 2n+1. The initial size of HashMap is 16, and it expands to twice its original size.
- If the initial capacity is specified when creating the collection, HashTable directly uses the given size, while HashMap expands it to a power-of-two size.
- Underlying data structure: When the length of a linked list in HashMap is greater than the threshold (default is 8), the linked list is converted into a red-black tree (if the current array length is less than 64, it will choose to expand the array first instead of converting it into a red-black tree). HashTable does not have such a mechanism.
- Implementation of the hash function: HashMap performs a mixed disturbance process on the high and low bits of the hash value to reduce collisions, while HashTable directly uses the hashCode() value of the key.

### Differences Between HashMap and TreeMap

Both TreeMap and HashMap inherit from AbstractMap, but it should be noted that TreeMap also implements the NavigableMap interface and the SortedMap interface.

Implementing the NavigableMap interface gives TreeMap the ability to search elements within the collection.

The NavigableMap interface provides rich methods for exploring and operating on key-value pairs:

- Directed search: methods such as ceilingEntry(), floorEntry(), higherEntry(), and lowerEntry() can be used to locate the closest key-value pair that is greater than or equal to, less than or equal to, strictly greater than, or strictly less than a given key.
- Subset operations: subMap(), headMap(), and tailMap() methods can efficiently create subset views of the original collection without copying the entire collection.
- Reverse-order view: the descendingMap() method returns a reverse-order NavigableMap view, making it possible to iterate through the entire TreeMap in reverse order.
- Boundary operations: methods such as firstEntry(), lastEntry(), pollFirstEntry(), and pollLastEntry() can conveniently access and remove elements.

Implementing the SortedMap interface gives TreeMap the ability to sort the elements in the collection by key. By default, it sorts keys in ascending order, but we can also specify a comparator for sorting.

In summary, compared with HashMap, TreeMap mainly adds the ability to sort elements in the collection by key and the ability to search elements within the collection.

### Underlying Implementation of HashMap

**Before JDK 1.8**

At this time, the underlying implementation of HashMap used a combination of array and linked list, that is, separate chaining. HashMap obtains a hash value after processing the key's hashcode through a disturbance function, and then uses (n - 1) & hash to determine the position where the current element should be stored (where n refers to the length of the array). If an element already exists at the current position, it determines whether the hash value and key of that element are the same as those of the element to be inserted. If they are the same, it directly overwrites the existing element; if not, it resolves the conflict using the separate chaining method.

The disturbance function (hash method) in HashMap is used to optimize the distribution of hash values. By performing additional processing on the original hashCode(), the disturbance function can reduce collisions caused by poor hashCode() implementations, thereby improving the uniformity of data distribution.

**After JDK 1.8**

There was a major change in resolving hash collisions: when the length of a linked list is greater than the threshold, the linked list is converted into a red-black tree.

The purpose of this is to reduce search time: the query efficiency of a linked list is O(n) (where n is the length of the linked list), while a red-black tree is a self-balancing binary search tree with query efficiency of O(log n). When the linked list is short, the performance difference between O(n) and O(log n) is not obvious. However, when the linked list becomes longer, query performance will decline significantly.

### Why the Length of HashMap Is a Power of 2

To make HashMap access efficient and reduce collisions, we need to ensure that data is distributed as evenly as possible. Hash values in Java are usually represented by int, whose range is -2147483648 ~ 2147483647, giving roughly 4 billion possible mappings in total. As long as the hash function maps values relatively evenly and sparsely, collisions are generally unlikely in typical applications. However, the problem is that an array with a length of 4 billion cannot fit in memory. Therefore, this hash value cannot be used directly. Before using it, we also need to perform a modulo operation based on the array length, and the resulting remainder can then be used as the storage position, that is, the corresponding array index.

How should this algorithm be designed?

We may first think of using the % modulo operation to implement it. But here comes the key point: “If the divisor in the modulo (%) operation is a power of 2, it is equivalent to the bitwise AND (&) operation with the divisor minus one (that is, hash%length==hash&(length-1) holds on the premise that length is 2 to the power of n).” In addition, using the binary bit operation & can improve computational efficiency compared with %.

Besides the fact that bit operations are more efficient than modulo operations, I think a more important reason is that when the length is a power of 2, HashMap can distribute elements more evenly during expansion. For example:

- When length = 8, length - 1 = 7, whose binary representation is 0111
- When length = 16, length - 1 = 15, whose binary representation is 1111

At this time, when the original elements in HashMap calculate their new array positions using hash&(length-1), the result depends on the fourth binary bit of the hash value (counting from the right), and two situations may occur:
- If the fourth binary bit is 0, the array position remains unchanged, which means the current element has the same position in the new array as in the old array.
- If the fourth binary bit is 1, the array position will be in the expanded part of the new array.

Finally, here is a simple summary of why the length of HashMap is a power of 2:

- Bit operations are more efficient: bitwise operation (&) is more efficient than modulo operation (%). When the length is a power of 2, hash % length is equivalent to hash & (length - 1).
- It can better ensure the uniform distribution of hash values: after expansion, if the hash values of the elements in the old array are relatively evenly distributed, the elements in the new array will also be distributed relatively evenly. In the best case, half of them will be in the first half of the new array, and half will be in the second half.
- The expansion mechanism becomes simple and efficient: after expansion, it only needs to check the change in the high bit of the hash value to determine the new position of the element. Either the position remains unchanged (the high bit is 0), or it moves to the new position (the high bit is 1, original index position + original capacity).