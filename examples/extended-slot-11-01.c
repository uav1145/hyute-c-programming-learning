#include <stdio.h>
#include <stdlib.h>
int main(void) {
    srand(1U);
    int x = rand();
    printf("Thuoc [0,RAND_MAX]: %s\n", (x >= 0 && x <= RAND_MAX) ? "co" : "khong");
    return 0;
}
