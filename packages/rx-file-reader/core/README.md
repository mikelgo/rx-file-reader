# @rx-file-reader/core

This library was generated with [Nx](https://nx.dev).

## Installation

```bash
npm install @rx-file-reader/core
```

## Basic Usage

```typescript

import { createRxFileReader$ } from '@rx-file-reader/core';

const inputElement = document.querySelector('input[type="file"]');
let file;
inputElement.addEventListener('change', (event) => {
  file = event.target.files[0];
});


const fileReader$ = createRxFileReader$({
  file: file,
  format: 'text',
});

fileReader$.subscribe({
  next: (event) => {
    console.log(event);
  },
  error: (error) => {
    console.error(error);
  },
  complete: () => {
    console.log('complete');
  },
});

```

## Versioning

This project uses [SemVer](http://semver.org/) for versioning.
