#deck.ext.js

Deck.ext.js provides a set of extensions, themes and use cases for the deck.js framework.
Deck.js is a JavaScript library for building modern HTML presentations which is flexible enough to let advanced CSS and JavaScript authors craft highly customized decks, but also provides templates and themes for the HTML novice to build a standard slideshow.

##deck.toc.js extension

This (alpha) extension provides the support for TOC within the deck.js framework.

### General Idea

The `deck.toc.js` extension uses the H* tags to build the TOC.

- H1 represents the title of the presentation
- H2 corresponds to a section
- H3 corresponds to a subsection
- H4 corresponds to a subsubsection

The TOC is automatically constructed when `deck.init` is called, and pressing
on `t` will toggle the TOC panel.

Elements in the TOC panel are clickable and thus it provides another way
to navigate easily in the slides.

### Example

The following:

        <section class="slide" id="title-slide">
            <h1>The Presentation Title</h1>
        </section>

        <section class="slide">
            <h2>Section 1</h2>
            <p>If you want to learn about making your own themes, extending deck.js, and more, check out the&nbsp;<a href="../docs/">documentation</a>.</p>
        </section>

        <section class="slide">
            <h3>Section 1.1</h3>
            <p>If you want to learn about making your own themes, extending deck.js, and more, check out the&nbsp;<a href="../docs/">documentation</a>.</p>
        </section>

        <section class="slide">
            <h3>Section 1.2</h3>
            <p>If you want to learn about making your own themes, extending deck.js, and more, check out the&nbsp;<a href="../docs/">documentation</a>.</p>
        </section>

        <section class="slide">
            <h2>Section 2</h2>
            <p>If you want to learn about making your own themes, extending deck.js, and more, check out the&nbsp;<a href="../docs/">documentation</a>.</p>
        </section>

        <section class="slide">
            <h2>Section 3</h2>
            <p>If you want to learn about making your own themes, extending deck.js, and more, check out the&nbsp;<a href="../docs/">documentation</a>.</p>
        </section>

will provide the following TOC:

- The Presentation Title
    - Section 1
        - Section 1.1
        - Section 1.2
    - Section 2
    - Section 3