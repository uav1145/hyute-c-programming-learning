#include <stdio.h>
#include <stddef.h>
#include <stdbool.h>
bool average(const int *a, size_t n, double *result) {
    if (n == 0 || a == NULL || result == NULL) return false;
    double sum = 0.0;
    for (size_t i = 0; i < n; ++i) sum += (double)a[i];
    *result = sum / (double)n;
    return true;
}
int main(void) {
    int a[] = {3, 5, 7};
    double t;
    if (average(a, sizeof a / sizeof a[0], &t))
        printf("TB=%.2f\n", t);
    return 0;
}
