# Manipulador de Gramáticas

Trabalho desenvolvido na disciplina de Linguagens Formais na Universidade
de Santa Cruz do Sul ([UNISC][]).

## O trabalho

O trabalho é dividido em duas partes. A primeira delas consiste em criar um
**manipulador de gramáticas** que permita criar interativamente uma gramática
do tipo *regular* ou do tipo *livre de contexto*. A segunda parte é a criação
de um **reconhecedor** do tipo *autômato finito*, capaz de reconhecer as
sentenças geradas com a gramática criada na primeira parte.

O manipulador de gramática deve permitir a entrada de uma gramática qualquer
pelo usuário, através de campos para a definição dos símbolos **não terminais**
e **terminais**, o símbolo de **início de produção** e todo o **conjunto de
produções**. A partir dessas entradas, é esperado que o programa verifique se
a gramática entrada é válida, exiba o seu formalismo, classifique-a entre
**Gramática Regular** ou **Gramática Livre de Contexto** e gere automaticamente
duas sentenças, no mínimo, para essa gramática.

O reconhecedor deve ser desenvolvido como um **autômato finito** e representado
através de uma **tabela de transição de estados**, que deve ser editável. O
autômato deve demonstrar passo-a-passo o processo de reconhecimento para as
sentenças geradas pelo manipulador de gramática.

## Licença

Este trabalho está disponível sob a licença MIT. Veja o arquivo LICENSE para
ler o texto completo da licença.

Este trabalho utiliza outras bibliotecas e ferramentas de terceiros, e cada um
deles possui sua própria licença que pode ser diferente da utilizada neste
trabalho. Consulte a documentação dessas bibliotecas para saber quais licenças
são utilizadas por cada uma delas.


[UNISC]: http://www.unisc.br "Universidade de Santa Cruz do Sul"
