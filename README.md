# Контрольное задание №5 — GraphQL и RabbitMQ

Небольшое серверное приложение: каталог книг и авторов.

Стек: **Node.js + Apollo Server + GraphQL + RabbitMQ**.

## Что делает приложение

- GraphQL API с двумя связанными типами: `Author` и `Book`
- Query списка книг и одной книги по `id`
- Mutation создания книги
- Резолвер связи: у книги есть автор, у автора есть список его книг
- При создании книги в очередь RabbitMQ уходит сообщение
- Отдельный consumer читает очередь и печатает данные книги в консоль

Данные хранятся в памяти процесса и сбрасываются при перезапуске API.

## GraphQL-схема

```graphql
type Author {
  id: ID!
  name: String!
  books: [Book!]!
}

type Book {
  id: ID!
  title: String!
  year: Int!
  author: Author!
}

type Query {
  books: [Book!]!
  book(id: ID!): Book
  authors: [Author!]!
  author(id: ID!): Author
}

type Mutation {
  createBook(title: String!, year: Int!, authorId: ID!): Book!
}
```

Стартовые данные:

| id | Автор                |
|----|----------------------|
| 1  | Лев Толстой          |
| 2  | Фёдор Достоевский    |

| id | Книга                         | Год  | authorId |
|----|-------------------------------|------|----------|
| 1  | Война и мир                   | 1869 | 1        |
| 2  | Анна Каренина                 | 1877 | 1        |
| 3  | Преступление и наказание      | 1866 | 2        |

## Запуск

Нужны **Node.js 18+**, **Docker** и **Docker Compose**.

Из корня проекта, в трёх терминалах.

Терминал 1 — брокер:

```bash
docker compose up
```

Панель RabbitMQ: [http://localhost:15672](http://localhost:15672)  
Логин `guest`, пароль `guest`. Очередь называется `books.created`.

Терминал 2 — GraphQL API:

```bash
npm install
npm start
```

Apollo Sandbox: [http://localhost:4000](http://localhost:4000)

Терминал 3 — consumer:

```bash
npm run consumer
```

Остановка брокера: `Ctrl+C` в первом терминале, затем при необходимости `docker compose down`.

## Сценарий демонстрации на сдаче

1. Поднять RabbitMQ: `docker compose up`
2. Запустить API: `npm start`
3. Открыть [http://localhost:4000](http://localhost:4000) — Apollo Sandbox
4. Список книг:

```graphql
query {
  books {
    id
    title
    year
    author {
      id
      name
    }
  }
}
```

5. Одна книга и связь в обе стороны (`Book.author` и `Author.books`):

```graphql
query {
  book(id: "1") {
    title
    year
    author {
      name
      books {
        id
        title
      }
    }
  }
}
```

6. Пока consumer не запущен, создать книгу:

```graphql
mutation {
  createBook(title: "Воскресение", year: 1899, authorId: "1") {
    id
    title
    year
    author {
      id
      name
    }
  }
}
```

В консоли API появится строка `Сообщение отправлено в очередь`. В панели RabbitMQ очередь `books.created` будет содержать 1 сообщение (вкладка Queues → `books.created` → Get messages).

7. Запустить consumer: `npm run consumer`  
В его консоли появится id, название, год и `authorId` созданной книги. Сообщение будет подтверждено (`ack`), и очередь опустеет.

8. Повторить список `books`: новая книга есть в ответе, поле `author` заполнено резолвером связи.

## Зачем нужны части стека (для сдачи)

- **GraphQL-схема** — контракт API: какие типы есть, какие поля у них есть и какие Query и Mutation можно вызвать.
- **Query** — чтение. `books` возвращает список, `book(id)` — один объект.
- **Mutation** — изменение данных. `createBook` добавляет книгу и после этого публикует сообщение.
- **Резолвер** — функция, которая вычисляет поле. `Book.author` по `authorId` находит автора, `Author.books` собирает книги этого автора. Клиент сам выбирает, какие поля вложенного объекта запросить.
- **Producer** — код API, который кладёт сообщение в очередь в момент создания книги.
- **Очередь `books.created`** — буфер в RabbitMQ. Сообщение лежит в ней, пока consumer его не заберёт. API не вызывает consumer напрямую.
- **Consumer** — отдельный процесс. Он подписан на ту же очередь, печатает полученную книгу и подтверждает обработку.

## Переменные окружения

Значения по умолчанию уже подходят для локального запуска. Менять их нужно только если порты или доступ к брокеру другие.

| Переменная     | По умолчанию                         | Назначение              |
|----------------|--------------------------------------|-------------------------|
| `PORT`         | `4000`                               | Порт GraphQL API        |
| `RABBITMQ_URL` | `amqp://guest:guest@localhost:5672`  | Адрес брокера           |
| `QUEUE_NAME`   | `books.created`                      | Имя очереди             |

## Структура проекта

```
kr5/
  src/
    server.js     # Apollo Server
    schema.js     # схема и резолверы
    data.js       # авторы и книги в памяти
    producer.js   # отправка сообщения в очередь
    consumer.js   # чтение очереди и вывод в консоль
    rabbit.js     # подключение к RabbitMQ
  docker-compose.yml
  package.json
  README.md
```
