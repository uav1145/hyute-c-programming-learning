#include <stdio.h>
int main(void) {
    char names[3][32] = {"An", "Binh", "Chi"};
    for (int i = 0; i < 3; ++i)
        printf("%d. %s\n", i + 1, names[i]);
    return 0;
}
