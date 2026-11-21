#include <stdio.h>
int tim(const int a[], int n, int x) {
    for (int i = 0; i < n; ++i)
        if (a[i] == x) return i;
    return -1;
}
int main(void) {
    int a[] = {7, 4, 10, 2, 4};
    int p = tim(a, 5, 10);
    printf("Vi tri = %d\n", p);
    return 0;
}
