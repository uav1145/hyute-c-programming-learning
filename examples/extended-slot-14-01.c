#include <stdio.h>
#include <stddef.h>
void selection_sort(int a[], size_t n) {
    for (size_t i = 0; i < n; ++i) {
        size_t min = i;
        for (size_t j = i + 1; j < n; ++j) {
            if (a[j] < a[min]) min = j;
        }
        int t = a[i]; a[i] = a[min]; a[min] = t;
    }
}
int binary_search(const int a[], size_t n, int x) {
    size_t lo = 0, hi = n;
    while (lo < hi) {
        size_t mid = lo + (hi - lo) / 2;
        if (a[mid] == x) return (int)mid;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid;
    }
    return -1;
}
int main(void) {
    int a[] = {7, 2, 9, 1, 4};
    size_t n = sizeof a / sizeof a[0];
    selection_sort(a, n);
    for (size_t i = 0; i < n; ++i) printf("%d%c", a[i], (i+1==n)?'\n':' ');
    printf("Vi tri 7=%d\n", binary_search(a, n, 7));
    return 0;
}
