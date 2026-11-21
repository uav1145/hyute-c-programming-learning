#include <stdio.h>
#include <string.h>
int main(void) {
    char ten[80];
    if (!fgets(ten, sizeof ten, stdin)) return 1;
    ten[strcspn(ten, "\n")] = '\0';
    printf("Xin chao, %s!\n", ten);
    return 0;
}
