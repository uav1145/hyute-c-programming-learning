#include <stdio.h>
#include <limits.h>
int main(void) {
    int x = INT_MIN;
    unsigned int mag = x < 0 ? 0U - (unsigned int)x : (unsigned int)x;
    printf("Do lon INT_MIN = %u\n", mag);
    return 0;
}
