#include <stdio.h>
#include <string.h>
int main(void) {
    const char *a = "An";
    const char *b = "Binh";
    printf("So sanh: %s\n", strcmp(a,b)<0 ? "An truoc" : "An khong truoc");
    const char *s = "Hoc lap trinh C";
    printf("Tim lap: %s\n", strstr(s,"lap")!=NULL ? "co" : "khong");
    return 0;
}
