#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
int main(void) {
    size_t n = 2U, bigger = 4U;
    int *a = malloc(n * sizeof *a);
    if (a == NULL) return 1;
    a[0] = 3; a[1] = 5;
    if (bigger > SIZE_MAX / sizeof *a) { free(a); return 1; }
    int *tmp = realloc(a, bigger * sizeof *a);
    if (tmp == NULL) { free(a); return 1; }
    a = tmp;
    a[2] = 7; a[3] = 9;
    printf("Tong=%d\n", a[0] + a[1] + a[2] + a[3]);
    free(a);
    a = NULL;
    return 0;
}
