#include <stdio.h>
int chu_vi(int dai, int rong) {
    return 2 * (dai + rong);
}
int main(void) {
    printf("Chu vi = %d\n", chu_vi(8, 3));
    return 0;
}
