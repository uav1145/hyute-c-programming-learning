#include <stdio.h>
#include <stddef.h>
int main(void) {
    char s[] = "HVAC";
    size_t i = 0;
    while (s[i] != '\0') ++i;
    printf("Do dai = %zu\n", i);
    return 0;
}
