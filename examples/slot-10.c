#include <stdio.h>
void hoan_doi(int *a, int *b) {
    int tam = *a;
    *a = *b;
    *b = tam;
}
int main(void) {
    int x = 2, y = 9;
    hoan_doi(&x, &y);
    printf("x=%d y=%d\n", x, y);
    return 0;
}
