#include <stdio.h>
#include <stddef.h>
int main(void) {
    char s[] = "  Lap   trinh   C  ";
    size_t rd = 0, wr = 0;
    while (s[rd] != '\0') {
        char c = s[rd++];
        if (c != ' ' || (wr > 0 && s[wr-1] != ' ')) {
            s[wr++] = c;
        }
    }
    if (wr > 0 && s[wr-1] == ' ') --wr;
    s[wr] = '\0';
    printf("Chuan hoa: %s\n", s);
    return 0;
}
