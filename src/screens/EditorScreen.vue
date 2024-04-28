<template>
  <div class="uk-container margin">
    <h1 class="uk-margin-top uk-flex-inline">
      Edit Profile&nbsp;
      <input
        type="text"
        class="uk-input uk-form-blank uk-form-width-large"
        placeholder="Filename"
        v-model="appStore.currentProfileName"
      >
    </h1>

    <p class="uk-text-lead">
      Edit your profile here. All options are optional. Click the corresponding
      button to add a field to the file, and use the trash bin to remove it
      again.
    </p>
    <div class="uk-alert-primary" uk-alert>
      <p>
        Pandoc is a complex platform and this tool is only meant as an aid to
        writing defaults files. While large parts of the Pandoc user manual have
        made it into this form, there have been many omittances. In addition,
        this form may become outdated and lag behind Pandoc's manual. In case of
        doubt, the official Pandoc's user guide will always take precedence.
      </p>
      <a class="uk-button uk-button-primary" href="https://pandoc.org/MANUAL.html" target="_blank">Open Pandoc's User Manual</a>
    </div>

    <form class="uk-form">
      <!-- READER -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">Pandoc Reader</legend>
        <p>
          Specify the input format. If the input or output format is not specified
          explicitly, pandoc will attempt to guess it from the extensions of the
          filenames.
        </p>
        <PandocReaderWriter
          v-if="props.profile.reader !== undefined"
          v-bind:readerWriter="props.profile.reader"
          v-bind:which="'reader'"
        ></PandocReaderWriter>
        <PrimaryButton v-else
          v-on:click="updateCurrentProfile({ reader: { name: pandocReaders[0], enabledExtensions: [], disabledExtensions: [] } })"
        >
          Add Reader
        </PrimaryButton>
      </fieldset>

      <hr>

      <!-- WRITER -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">Pandoc Writer</legend>
        <p>
          Specify the output format. If the input or output format is not
          specified explicitly, pandoc will attempt to guess it from the
          extensions of the filenames.
        </p>
        <PandocReaderWriter
          v-if="props.profile.writer !== undefined"
          v-bind:readerWriter="props.profile.writer"
          v-bind:which="'writer'"
        ></PandocReaderWriter>
        <PrimaryButton v-else
          v-on:click="updateCurrentProfile({ writer: { name: pandocWriters[0], enabledExtensions: [], disabledExtensions: [] } })"
        >
          Add Writer
        </PrimaryButton>
      </fieldset>

      <hr>

      <!-- INPUT AND OUTPUT -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">
          Input and Output
        </legend>
        <p>
          Here you can specify input- and output file(s). This can make sense if
          you aim to create a profile that allows you to, e.g., export varying
          input files to a specified output file, or export the same file(s) to
          varying output files. Usually, you'd want to dynamically specify these
          arguments for each pandoc-run on the command-line.
        </p>
        <!-- Input files. -->
        <MultiStringElement
          v-bind:label="'Input file(s)'"
          v-bind:element="'input-files'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            The value of input-files may be left empty to indicate input from
            stdin, and it can be an empty sequence [] for no input.
          </template>
        </MultiStringElement>
        <!-- Output file. -->
        <SingleStringElement
          v-bind:element="'output-file'"
          v-bind:profile="props.profile"
          v-bind:label="'Output file'"
        >
          <template v-slot:description>
            Write output to FILE instead of stdout. If FILE is -, output will go
            to stdout, even if a non-textual format (docx, odt, epub2, epub3) is
            specified. If the output format is chunkedhtml and FILE has no
            extension, then instead of producing a .zip file pandoc will create
            a directory FILE and unpack the zip archive there (unless FILE
            already exists, in which case an error will be raised).
          </template>
        </SingleStringElement>
      </fieldset>

      <hr>

      <!-- RESOURCES -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">Resources</legend>
        <p>
          This section allows you to specify various resources that pandoc
          should have access to. This includes search paths as well as
          additional default files, should you need them.
        </p>
        <!-- RESOURCE PATHS -->
        <MultiStringElement
          v-bind:label="'Resource paths'"
          v-bind:element="'resource-path'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            List of paths to search for images and other resources. The paths
            should be separated by <code>:</code> on Linux, UNIX, and macOS
            systems, and by <code>;</code> on Windows. If
            <code>--resource-path</code> is not specified, the default resource
            path is the working directory. Note that, if
            <code>--resource-path</code> is specified, the working directory
            must be explicitly listed or it will not be searched. For example:
            <code>--resource-path=.:test</code> will search the working
            directory and the test subdirectory, in that order. This option can
            be used repeatedly. Search path components that come later on the
            command line will be searched before those that come earlier, so
            <code>--resource-path foo:bar --resource-path baz:bim</code> is
            equivalent to <code>--resource-path baz:bim:foo:bar</code>. Note
            that this option only has an effect when pandoc itself needs to find
            an image (e.g., in producing a PDF or docx, or when
            <code>--embed-resources</code> is used.) It will not cause image
            paths to be rewritten in other cases (e.g., when pandoc is
            generating LaTeX or HTML).
          </template>
        </MultiStringElement>

        <!-- DATA DIR -->
        <SingleStringElement
          v-bind:element="'data-dir'"
          v-bind:profile="props.profile"
          v-bind:label="'Data directory'"
        >
          <template v-slot:description>
            Specify the user data directory to search for pandoc data files. If
            this option is not specified, the default user data directory will
            be used. On *nix and macOS systems this will be the pandoc
            subdirectory of the XDG data directory (by default,
            <code>$HOME/.local/share</code>, overridable by setting the
            <code>XDG_DATA_HOME</code> environment variable). If that directory
            does not exist and <code>$HOME/.pandoc</code> exists, it will be
            used (for backwards compatibility). On Windows the default user data
            directory is %APPDATA%\pandoc. You can find the default user data
            directory on your system by looking at the output of pandoc
            <code>--version</code>. Data files placed in this directory (for
            example, reference.odt, reference.docx, epub.css, templates) will
            override pandoc’s normal defaults. (Note that the user data
            directory is not created by pandoc, so you will need to create it
            yourself if you want to make use of it.)
          </template>
        </SingleStringElement>

        <!-- DEFAULTS -->
        <MultiStringElement
          v-bind:label="'Defaults files'"
          v-bind:element="'defaults'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Specify a set of additional default option settings. FILE is a
            YAML file whose fields correspond to command-line option
            settings. All options for document conversion, including input
            and output files, can be set using a defaults file. The file
            will be searched for first in the working directory, and then in
            the defaults subdirectory of the user data directory (see
            <code>--data-dir</code>). The .yaml extension may be omitted. See
            the section Defaults files for more information on the file format.
            Settings from the defaults file may be overridden or extended by
            subsequent options on the command line.
          </template>
        </MultiStringElement>
      </fieldset>

      <hr>

      <!-- GENERAL READER OPTIONS -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">General Reader options</legend>
        <p>
          This section contains general properties that allow you to direct the
          behavior of pandoc's readers.
        </p>

        <NumberElement
          v-bind:label="'Shift heading level by'"
          v-bind:element="'shift-heading-level-by'"
          v-bind:profile="props.profile"
          v-bind:default-value="0"
        >
          <template v-slot:description>
            Shift heading levels by a positive or negative integer. For example,
            with <code>-1</code>, level 2 headings become level 1
            headings, and level 3 headings become level 2 headings. Headings
            cannot have a level less than 1, so a heading that would be shifted
            below level 1 becomes a regular paragraph. Exception: with a shift
            of <code>-N</code>, a level-N heading at the beginning of the
            document replaces the metadata title. <code>-1</code> is a good
            choice when converting HTML or Markdown documents that use an
            initial level-1 heading for the document title and level-2+ headings
            for sections. <code>1</code> may be a good choice for converting
            Markdown documents that use level-1 headings for sections to HTML,
            since pandoc uses a level-1 heading to render the document title.
          </template>
        </NumberElement>

        <MultiStringElement
          v-bind:label="'Indented Code Classes'"
          v-bind:element="'indented-code-classes'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Specify classes to use for indented code blocks &ndash; for example,
            <code>perl</code>, <code>numberLines</code> or <code>haskell</code>.
            Add one class per entry.
          </template>
        </MultiStringElement>

        <SingleStringElement
          v-bind:element="'default-image-extension'"
          v-bind:profile="props.profile"
          v-bind:label="'Default image extension'"
        >
          <template v-slot:description>
            Specify a default extension to use when image paths/URLs have no
            extension. This allows you to use the same source for formats that
            require different kinds of images. Currently this option only
            affects the Markdown and LaTeX readers.
          </template>
        </SingleStringElement>

        <CheckboxElement
          v-bind:checked="profile['file-scope'] === true"
          v-on:change="flipToggle('file-scope')"
          v-bind:label="'Process input files one by one'"
        >
          <template v-slot:description>
            Parse each file individually before combining for multifile
            documents. This will allow footnotes in different files with the
            same identifiers to work as expected. If this option is set,
            footnotes and links will not work across files. Reading binary files
            (docx, odt, epub) implies <code>--file-scope</code>. If two or more
            files are processed using <code>--file-scope</code>, prefixes based
            on the filenames will be added to identifiers in order to
            disambiguate them, and internal links will be adjusted accordingly.
            For example, a header with identifier <code>foo</code> in
            <code>subdir/file1.txt</code> will have its identifier changed to
            <code>subdir__file1.txt__foo</code>.
            
            In addition, a Div with an identifier based on the filename will be
            added around the file's content, so that internal links to the
            filename will point to this Div's identifier.
          </template>
        </CheckboxElement>

        <FilterElement
          v-bind:element="'filters'"
          v-bind:profile="props.profile"
          v-bind:label="'Filters'"
        >
          <template v-slot:description>
            A "filter" is a program that modifies the AST, between the reader
            and the writer.<br>
            <br>
            <pre><code>INPUT --reader--&gt; AST --filter--&gt; AST --writer--&gt; OUTPUT</code></pre><br>
            <br>
            Each filter has a type, <code>lua</code> or <code>json</code>, and a
            path to it (relative or absolute). Pandoc supports two kinds of
            filters:<br>
            <br>
            Lua filters use the Lua language to define transformations on the
            pandoc AST. They are described in a separate document.<br>
            <br>
            JSON filters, described here, are pipes that read from standard
            input and write to standard output, consuming and producing a JSON
            representation of the pandoc AST.<br>
            <br>
            Lastly, you can simply define a "citeproc" filter that will process
            citations from the source document.
          </template>
        </FilterElement>

        <SingleStringElement
          v-bind:element="'lua-filter'"
          v-bind:profile="props.profile"
          v-bind:label="'Lua filter'"
        >
          <template v-slot:description>
            <p>
              Transform the document in a similar fashion as JSON filters (see
              <code>--filter</code>), but use pandoc's built-in Lua filtering
              system. The given Lua script is expected to return a list of Lua
              filters which will be applied in order. Each Lua filter must contain
              element-transforming functions indexed by the name of the AST
              element on which the filter function should be applied.
            </p>

            <p>
              The pandoc Lua module provides helper functions for element
              creation. It is always loaded into the script's Lua environment.
            </p>

            <p>
              See the Lua filters documentation for further details.
            </p>

            <p>
              In order of preference, pandoc will look for Lua filters in
            </p>
            <ol>
              <li>a specified full or relative path,</li>
              <li><code>$DATADIR/filters</code> where <code>$DATADIR</code> is the user data directory (see <code>--data-dir</code>, above).</li>
            </ol>
            <p>
              Filters, Lua filters, and citeproc processing are applied in the
              order specified on the command line.
            </p>
          </template>
        </SingleStringElement>

          <RecordElement
            v-bind:element="'metadata'"
            v-bind:profile="props.profile"
            v-bind:label="'Metadata'"
          >
            <template v-slot:description>
              Metadata is a list of key-value pairs. A value specified on the
              command line overrides a value specified in the document using
              YAML metadata blocks. Values will be parsed as YAML boolean or
              string values. If no value is specified, the value will be treated
              as Boolean true. Like <code>--variable</code>,
              <code>--metadata</code> causes template variables to be set. But
              unlike <code>--variable</code>, <code>--metadata</code> affects
              the metadata of the underlying document (which is accessible from
              filters and may be printed in some output formats) and metadata
              values will be escaped when inserted into the template.
            </template>
          </RecordElement>


        <MultiStringElement
          v-bind:label="'Metadata files'"
          v-bind:element="'metadata-files'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Read metadata from the supplied YAML (or JSON) file. This option can
            be used with every input format, but string scalars in the metadata
            file will always be parsed as Markdown. (If the input format is
            Markdown or a Markdown variant, then the same variant will be used
            to parse the metadata file; if it is a non-Markdown format, pandoc's
            default Markdown extensions will be used.) This option can be used
            repeatedly to include multiple metadata files; values in files
            specified later on the command line will be preferred over those
            specified in earlier files. Metadata values specified inside the
            document, or by using -M, overwrite values specified with this
            option. The file will be searched for first in the working
            directory, and then in the metadata subdirectory of the user data
            directory (see <code>--data-dir</code>).
          </template>
        </MultiStringElement>

        <CheckboxElement
          v-bind:checked="profile['preserve-tabs'] === true"
          v-on:change="flipToggle('preserve-tabs')"
          v-bind:label="'Preserve tabs'"
        >
          <template v-slot:description>
            Preserve tabs instead of converting them to spaces. (By default,
            pandoc converts tabs to spaces before parsing its input.) Note that
            this will only affect tabs in literal code spans and code blocks.
            Tabs in regular text are always treated as spaces.
          </template>
        </CheckboxElement>

        <NumberElement
          v-bind:label="'Tab stop'"
          v-bind:element="'tab-stop'"
          v-bind:profile="props.profile"
          v-bind:default-value="0"
        >
          <template v-slot:description>
            Specify the number of spaces per tab (default is 4).
          </template>
        </NumberElement>

        <SelectElement
          v-bind:label="'Track Changes'"
          v-bind:element="'track-changes'"
          v-bind:profile="props.profile"
          v-bind:values="['accept', 'reject', 'all']"
        >
          <template v-slot:description>
            Specifies what to do with insertions, deletions, and comments
            produced by the MS Word “Track Changes” feature. accept (the
            default) processes all the insertions and deletions. reject ignores
            them. Both accept and reject ignore comments. all includes all
            insertions, deletions, and comments, wrapped in spans with
            insertion, deletion, comment-start, and comment-end classes,
            respectively. The author and time of change is included. all is
            useful for scripting: only accepting changes from a certain
            reviewer, say, or before a certain date. If a paragraph is inserted
            or deleted, track-changes=all produces a span with the class
            paragraph-insertion/paragraph-deletion before the affected paragraph
            break. This option only affects the docx reader.
          </template>
        </SelectElement>

        <SingleStringElement
          v-bind:element="'extract-media'"
          v-bind:profile="props.profile"
          v-bind:label="'Media Extraction Folder'"
        >
          <template v-slot:description>
            Extract images and other media contained in or linked from the
            source document to the path DIR, creating it if necessary, and
            adjust the images references in the document so they point to the
            extracted files. Media are downloaded, read from the file system,
            or extracted from a binary container (e.g. docx), as needed. The
            original file paths are used if they are relative paths not
            containing <code>..</code>. Otherwise filenames are constructed from
            the SHA1 hash of the contents.
          </template>
        </SingleStringElement>

        <SingleStringElement
          v-bind:element="'abbreviations'"
          v-bind:profile="props.profile"
          v-bind:label="'Abbreviations file'"
        >
          <template v-slot:description>
            Specifies a custom abbreviations file, with abbreviations one to a
            line. If this option is not specified, pandoc will read the data
            file abbreviations from the user data directory or fall back on a
            system default. To see the system default, use pandoc
            <code>--print-default-data-file=abbreviations</code>. The only use
            pandoc makes of this list is in the Markdown reader. Strings found
            in this list will be followed by a nonbreaking space, and the period
            will not produce sentence-ending space in formats like LaTeX. The
            strings may not contain spaces.
          </template>
        </SingleStringElement>
      </fieldset>

      <hr>

      <!-- GENERAL WRITER OPTIONS -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">General Writer options</legend>
        <p>
          This section contains general properties that allow you to direct the
          behavior of pandoc's writers.
        </p>

        <CheckboxElement
          v-bind:checked="profile.standalone === true"
          v-on:change="flipToggle('standalone')"
          v-bind:label="'Produce a standalone-file'"
        >
          <template v-slot:description>
            Produce output with an appropriate header and footer (e.g. a
            standalone HTML, LaTeX, TEI, or RTF file, not a fragment). This
            option is set automatically for pdf, epub, epub3, fb2, docx, and odt
            output. For native output, this option causes metadata to be
            included; otherwise, metadata is suppressed.
          </template>
        </CheckboxElement>

        <SingleStringElement
          v-bind:element="'template'"
          v-bind:profile="props.profile"
          v-bind:label="'Template file'"
        >
          <template v-slot:description>
            Use the specified file as a custom template for the generated
            document. Implies --standalone. See Templates, below, for a
            description of template syntax. If no extension is specified, an
            extension corresponding to the writer will be added, so that
            <code>--template=special</code> looks for <code>special.html</code>
            for HTML output. If the template is not found, pandoc will search
            for it in the templates subdirectory of the user data directory (see
            <code>--data-dir</code>). If this option is not used, a default
            template appropriate for the output format will be used (see
            <code>-D</code>/<code>--print-default-template</code>).
          </template>
        </SingleStringElement>

          <RecordElement
            v-bind:element="'variables'"
            v-bind:profile="props.profile"
            v-bind:label="'Variables'"
          >
            <template v-slot:description>
              Variables are key-value pairs that are made available by Pandoc to
              templates when rendering documents in standalone mode. The default
              templates of Pandoc use a small set of variables that you can find
              in the Pandoc manual. For building your own templates, you can add
              arbitrary variables here.
            </template>
          </RecordElement>

        <CheckboxElement
          v-bind:checked="profile.sandbox === true"
          v-on:change="flipToggle('sandbox')"
          v-bind:label="'Enable sandbox'"
        >
          <template v-slot:description>
            Run pandoc in a sandbox, limiting IO operations in readers and
            writers to reading the files specified on the command line. Note
            that this option does not limit IO operations by filters or in the
            production of PDF documents. But it does offer security against, for
            example, disclosure of files through the use of include directives.
            Anyone using pandoc on untrusted user input should use this option.

            Note: some readers and writers (e.g., docx) need access to data
            files. If these are stored on the file system, then pandoc will not
            be able to find them when run in sandbox mode and will raise an
            error. For these applications, we recommend using a pandoc binary
            compiled with the embed_data_files option, which causes the data
            files to be baked into the binary instead of being stored on the
            file system.
          </template>
        </CheckboxElement>

        <SelectElement
          v-bind:label="'End of Line Behavior'"
          v-bind:element="'eol'"
          v-bind:profile="props.profile"
          v-bind:values="['crlf', 'lf', 'native']"
        >
          <template v-slot:description>
            Manually specify line endings: CRLF (Windows), LF
            (macOS/Linux/UNIX), or native (line endings appropriate to the OS
            on which pandoc is being run). The default is native.
          </template>
        </SelectElement>

        <NumberElement
          v-bind:label="'DPI'"
          v-bind:element="'dpi'"
          v-bind:profile="props.profile"
          v-bind:default-value="72"
        >
          <template v-slot:description>
            Specify the default dpi (dots per inch) value for conversion from
            pixels to inch/centimeters and vice versa. (Technically, the correct
            term would be ppi: pixels per inch.) The default is 96dpi. When
            images contain information about dpi internally, the encoded value
            is used instead of the default specified by this option.
          </template>
        </NumberElement>

        <SelectElement
          v-bind:label="'Wrapping Behavior'"
          v-bind:element="'wrap'"
          v-bind:profile="props.profile"
          v-bind:values="['auto', 'none', 'preserve']"
        >
          <template v-slot:description>
            Determine how text is wrapped in the output (the source code, not
            the rendered version). With auto (the default), pandoc will attempt
            to wrap lines to the column width specified by <code>--columns</code>
            (default 72). With none, pandoc will not wrap lines at all. With
            preserve, pandoc will attempt to preserve the wrapping from the
            source document (that is, where there are nonsemantic newlines in
            the source, there will be nonsemantic newlines in the output as
            well). In ipynb output, this option affects wrapping of the contents
            of Markdown cells.
          </template>
        </SelectElement>

        <NumberElement
          v-bind:label="'Wrap after Columns'"
          v-bind:element="'columns'"
          v-bind:profile="props.profile"
          v-bind:default-value="72"
        >
          <template v-slot:description>
            Specify length of lines in characters. This affects text wrapping in
            the generated source code (see <code>--wrap</code>). It also affects
            calculation of column widths for plain text tables (see Tables
            below).
          </template>
        </NumberElement>

        <CheckboxElement
          v-bind:checked="profile.toc === true"
          v-on:change="flipToggle('toc')"
          v-bind:label="'Generate a table of contents'"
        >
          <template v-slot:description>
            Include an automatically generated table of contents (or, in the
            case of latex, context, docx, odt, opendocument, rst, or ms, an
            instruction to create one) in the output document. This option has
            no effect unless <code>-s</code>/<code>--standalone</code> is used,
            and it has no effect on man, docbook4, docbook5, or jats output.

            Note that if you are producing a PDF via ms, the table of contents
            will appear at the beginning of the document, before the title. If
            you would prefer it to be at the end of the document, use the option
            <code>--pdf-engine-opt=--no-toc-relocation</code>.
          </template>
        </CheckboxElement>

        <NumberElement
          v-bind:label="'Table of Contents-depth'"
          v-bind:profile="props.profile"
          v-bind:element="'toc-depth'"
          v-bind:default-value="2"
        >
          <template v-slot:description>
            Specify the number of section levels to include in the table of
            contents. The default is 3 (which means that level-1, 2, and 3
            headings will be listed in the contents).
          </template>
        </NumberElement>

        <CheckboxElement
          v-bind:checked="profile['strip-comments'] === true"
          v-on:change="flipToggle('strip-comments')"
          v-bind:label="'Strip comments'"
        >
          <template v-slot:description>
            Strip out HTML comments in the Markdown or Textile source, rather
            than passing them on to Markdown, Textile or HTML output as raw
            HTML. This does not apply to HTML comments inside raw HTML blocks
            when the <code>markdown_in_html_blocks</code> extension is not set.
          </template>
        </CheckboxElement>

        <SingleStringElement
          v-bind:element="'highlight-style'"
          v-bind:profile="props.profile"
          v-bind:label="'Highlight style'"
        >
          <template v-slot:description>
            Specifies the coloring style to be used in highlighted source code.
            Options are pygments (the default), kate, monochrome, breezeDark,
            espresso, zenburn, haddock, and tango. For more information on
            syntax highlighting in pandoc, see Syntax highlighting, below. See
            also <code>--list-highlight-styles</code>.

            Instead of a STYLE name, a JSON file with extension .theme may be
            supplied. This will be parsed as a KDE syntax highlighting theme and
            (if valid) used as the highlighting style.

            To generate the JSON version of an existing style, use
            <code>--print-highlight-style</code>.
          </template>
        </SingleStringElement>

        <MultiStringElement
          v-bind:label="'Syntax definitions'"
          v-bind:element="'syntax-definitions'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Instructs pandoc to load a KDE XML syntax definition file, which
            will be used for syntax highlighting of appropriately marked code
            blocks. This can be used to add support for new languages or to use
            altered syntax definitions for existing languages. This option may
            be repeated to add multiple syntax definitions.
          </template>
        </MultiStringElement>

        <MultiStringElement
          v-bind:label="'Header includes'"
          v-bind:element="'include-in-header'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Include contents of FILE, verbatim, at the end of the header. This
            can be used, for example, to include special CSS or JavaScript in
            HTML documents. This option can be used repeatedly to include
            multiple files in the header. They will be included in the order
            specified. Implies <code>--standalone</code>.
          </template>
        </MultiStringElement>

        <MultiStringElement
          v-bind:label="'Includes before body'"
          v-bind:element="'include-before-body'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Include contents of FILE, verbatim, at the beginning of the document
            body (e.g. after the <code>&lt;body&gt;</code> tag in HTML, or the
            <code>\begin{document}</code> command in LaTeX). This can be used to
            include navigation bars or banners in HTML documents. This option
            can be used repeatedly to include multiple files. They will be
            included in the order specified. Implies <code>--standalone</code>.
          </template>
        </MultiStringElement>

        <MultiStringElement
          v-bind:label="'Includes after body'"
          v-bind:element="'include-after-body'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Include contents of FILE, verbatim, at the end of the document body
            (before the <code>&lt;/body&gt;</code> tag in HTML, or the
            <code>\end{document}</code> command in LaTeX). This option can be
            used repeatedly to include multiple files. They will be included in
            the order specified. Implies <code>--standalone</code>.
          </template>
        </MultiStringElement>

        <!-- TODO: 'request-headers'?: Array<[string, string]> -->

        <CheckboxElement
          v-bind:checked="profile['no-check-certificate'] === true"
          v-on:change="flipToggle('no-check-certificate')"
          v-bind:label="'Disable certificate check'"
        >
          <template v-slot:description>
            Disable the certificate verification to allow access to unsecure
            HTTP resources (for example when the certificate is no longer valid
            or self signed).
          </template>
        </CheckboxElement>
      </fieldset>

      <hr>

      <!-- SPECIFIC WRITER OPTIONS -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">Options affecting specific writers</legend>

        <CheckboxElement
          v-bind:checked="profile['embed-resources'] === true"
          v-on:change="flipToggle('embed-resources')"
          v-bind:label="'Embed resources'"
        >
          <template v-slot:description>
            Produce a standalone HTML file with no external dependencies, using
            data: URIs to incorporate the contents of linked scripts,
            stylesheets, images, and videos. The resulting file should be
            self-contained, in the sense that it needs no external files and no
            net access to be displayed properly by a browser. This option works
            only with HTML output formats, including html4, html5, html+lhs,
            html5+lhs, s5, slidy, slideous, dzslides, and revealjs. Scripts,
            images, and stylesheets at absolute URLs will be downloaded; those
            at relative URLs will be sought relative to the working directory
            (if the first source file is local) or relative to the base URL (if
            the first source file is remote). Elements with the attribute
            data-external=1 will be left alone; the documents they link to will
            not be incorporated in the document. Limitation: resources that are
            loaded dynamically through JavaScript cannot be incorporated; as a
            result, fonts may be missing when --mathjax is used, and some
            advanced features (e.g. zoom or speaker notes) may not work in an
            offline self-contained reveal.js slide show.
          </template>
        </CheckboxElement>

        <CheckboxElement
          v-bind:checked="profile['html-q-tags'] === true"
          v-on:change="flipToggle('html-q-tags')"
          v-bind:label="'HTML <q>-tags'"
        >
          <template v-slot:description>
            Use <code>&lt;q&gt;</code> tags for quotes in HTML. (This option
            only has an effect if the smart extension is enabled for the input
            format used.)
          </template>
        </CheckboxElement>

        <CheckboxElement
          v-bind:checked="profile.ascii === true"
          v-on:change="flipToggle('ascii')"
          v-bind:label="'ASCII'"
        >
          <template v-slot:description>
            Use only ASCII characters in output. Currently supported for XML and
            HTML formats (which use entities instead of UTF-8 when this option
            is selected), CommonMark, gfm, and Markdown (which use entities),
            roff man and ms (which use hexadecimal escapes), and to a limited
            degree LaTeX (which uses standard commands for accented characters
            when possible).
          </template>
        </CheckboxElement>

        <CheckboxElement
          v-bind:checked="profile['reference-links'] === true"
          v-on:change="flipToggle('reference-links')"
          v-bind:label="'Reference links'"
        >
          <template v-slot:description>
            Use reference-style links, rather than inline links, in writing
            Markdown or reStructuredText. By default inline links are used. The
            placement of link references is affected by the
            <code>--reference-location</code> option.
          </template>
        </CheckboxElement>

        <SelectElement
          v-bind:label="'Reference location'"
          v-bind:element="'reference-location'"
          v-bind:profile="props.profile"
          v-bind:values="['block', 'section', 'document']"
        >
          <template v-slot:description>
            Specify whether footnotes (and references, if reference-links is
            set) are placed at the end of the current (top-level) block, the
            current section, or the document. The default is document. Currently
            this option only affects the markdown, muse, html, epub, slidy, s5,
            slideous, dzslides, and revealjs writers. In slide formats,
            specifying --reference-location=section will cause notes to be
            rendered at the bottom of a slide.
          </template>
        </SelectElement>

        <SelectElement
          v-bind:label="'Markdown Heading Style'"
          v-bind:element="'markdown-headings'"
          v-bind:profile="props.profile"
          v-bind:values="['setext', 'atx']"
        >
          <template v-slot:description>
            Specify whether to use ATX-style (#-prefixed) or Setext-style
            (underlined) headings for level 1 and 2 headings in Markdown output.
            (The default is atx.) ATX-style headings are always used for levels
            3+. This option also affects Markdown cells in ipynb output.
          </template>
        </SelectElement>

        <CheckboxElement
          v-bind:checked="profile['list-tables'] === true"
          v-on:change="flipToggle('list-tables')"
          v-bind:label="'List tables'"
        >
          <template v-slot:description>
            Render tables as list tables in RST output.
          </template>
        </CheckboxElement>

        <SelectElement
          v-bind:label="'Top-level division'"
          v-bind:element="'top-level-division'"
          v-bind:profile="props.profile"
          v-bind:values="['default', 'section', 'chapter', 'part']"
        >
          <template v-slot:description>
            Treat top-level headings as the given division type in LaTeX,
            ConTeXt, DocBook, and TEI output. The hierarchy order is part,
            chapter, then section; all headings are shifted such that the
            top-level heading becomes the specified type. The default behavior
            is to determine the best division type via heuristics: unless other
            conditions apply, section is chosen. When the documentclass variable
            is set to report, book, or memoir (unless the article option is
            specified), chapter is implied as the setting for this option. If
            beamer is the output format, specifying either chapter or part will
            cause top-level headings to become \part{..}, while second-level
            headings remain as their default type.
          </template>
        </SelectElement>

        <CheckboxElement
          v-bind:checked="profile['number-sections'] === true"
          v-on:change="flipToggle('number-sections')"
          v-bind:label="'Number sections'"
        >
          <template v-slot:description>
            Number section headings in LaTeX, ConTeXt, HTML, Docx, ms, or EPUB
            output. By default, sections are not numbered. Sections with class
            unnumbered will never be numbered, even if <code>--number-sections</code>
            is specified.
          </template>
        </CheckboxElement>

        <SingleStringElement
          v-bind:element="'number-offset'"
          v-bind:profile="props.profile"
          v-bind:label="'Number offset'"
        >
          <template v-slot:description>
            Offset for section headings in HTML output (ignored in other output
            formats). The first number is added to the section number for
            top-level headings, the second for second-level headings, and so on.
            So, for example, if you want the first top-level heading in your
            document to be numbered "6", specify <code>--number-offset=5</code>.
            If your document starts with a level-2 heading which you want to be
            numbered "1.5", specify <code>--number-offset=1,4</code>. Offsets
            are 0 by default. Implies <code>--number-sections</code>.
          </template>
        </SingleStringElement>

        <CheckboxElement
          v-bind:checked="profile.listings === true"
          v-on:change="flipToggle('listings')"
          v-bind:label="'Listings'"
        >
          <template v-slot:description>
            Use the listings package for LaTeX code blocks. The package does not
            support multi-byte encoding for source code. To handle UTF-8 you
            would need to use a custom template. This issue is fully documented
            here: Encoding issue with the listings package.
          </template>
        </CheckboxElement>

        <CheckboxElement
          v-bind:checked="profile.incremental === true"
          v-on:change="flipToggle('incremental')"
          v-bind:label="'Incremental'"
        >
          <template v-slot:description>
            Make list items in slide shows display incrementally (one by one).
            The default is for lists to be displayed all at once.
          </template>
        </CheckboxElement>

        <NumberElement
          v-bind:label="'Slide Level'"
          v-bind:element="'slide-level'"
          v-bind:profile="props.profile"
          v-bind:default-value="2"
        >
          <template v-slot:description>
            Specifies that headings with the specified level create slides (for
            beamer, s5, slidy, slideous, dzslides). Headings above this level in
            the hierarchy are used to divide the slide show into sections;
            headings below this level create subheads within a slide. Valid
            values are 0-6. If a slide level of 0 is specified, slides will not
            be split automatically on headings, and horizontal rules must be
            used to indicate slide boundaries. If a slide level is not specified
            explicitly, the slide level will be set automatically based on the
            contents of the document; see Structuring the slide show.
          </template>
        </NumberElement>

        <CheckboxElement
          v-bind:checked="profile['section-divs'] === true"
          v-on:change="flipToggle('section-divs')"
          v-bind:label="'Section Divs'"
        >
          <template v-slot:description>
            Wrap sections in <code>&lt;section&gt;</code> tags (or
            <code>&lt;div&gt;</code> tags for html4), and attach identifiers to
            the enclosing <code>&lt;section&gt;</code> (or
            <code>&lt;div&gt;</code>) rather than the heading itself (see
            Heading identifiers, below). This option only affects HTML output
            (and does not affect HTML slide formats).
          </template>
        </CheckboxElement>

        <SelectElement
          v-bind:label="'Email obfuscation'"
          v-bind:element="'email-obfuscation'"
          v-bind:profile="props.profile"
          v-bind:values="['none', 'javascript', 'references']"
        >
          <template v-slot:description>
            Specify a method for obfuscating mailto: links in HTML documents.
            none leaves mailto: links as they are. javascript obfuscates them
            using JavaScript. references obfuscates them by printing their
            letters as decimal or hexadecimal character references. The default
            is none.
          </template>
        </SelectElement>

        <SingleStringElement
          v-bind:element="'id-prefix'"
          v-bind:profile="props.profile"
          v-bind:label="'ID Prefix'"
        >
          <template v-slot:description>
            Specify a prefix to be added to all identifiers and internal links
            in HTML and DocBook output, and to footnote numbers in Markdown and
            Haddock output. This is useful for preventing duplicate identifiers
            when generating fragments to be included in other pages.
          </template>
        </SingleStringElement>

        <SingleStringElement
          v-bind:element="'title-prefix'"
          v-bind:profile="props.profile"
          v-bind:label="'Title Prefix'"
        >
          <template v-slot:description>
            Specify STRING as a prefix at the beginning of the title that appears in the HTML header (but not in the title as it appears at the beginning of the HTML body). Implies --standalone.
          </template>
        </SingleStringElement>

        <MultiStringElement
          v-bind:label="'CSS files'"
          v-bind:element="'css'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Link to a CSS style sheet. This option can be used repeatedly to
            include multiple files. They will be included in the order
            specified. This option only affects HTML (including HTML slide
            shows) and EPUB output. It should be used together with
            <code>-s</code>/<code>--standalone</code>, because the link to the
            stylesheet goes in the document header.
          </template>
        </MultiStringElement>

        <SingleStringElement
          v-bind:element="'reference-doc'"
          v-bind:profile="props.profile"
          v-bind:label="'Reference Document'"
        >
          <template v-slot:description>
            Use the specified file as a style reference in producing a docx or
            ODT file.
          </template>
        </SingleStringElement>

        <NumberElement
          v-bind:label="'Split Level'"
          v-bind:element="'split-level'"
          v-bind:profile="props.profile"
          v-bind:default-value="2"
        >
          <template v-slot:description>
            Specify the heading level at which to split an EPUB or chunked HTML
            document into separate files. The default is to split into chapters
            at level-1 headings. In the case of EPUB, this option only affects
            the internal composition of the EPUB, not the way chapters and
            sections are displayed to users. Some readers may be slow if the
            chapter files are too large, so for large documents with few level-1
            headings, one might want to use a chapter level of 2 or 3. For
            chunked HTML, this option determines how much content goes in each
            "chunk."
          </template>
        </NumberElement>

        <SingleStringElement
          v-bind:element="'chunk-template'"
          v-bind:profile="props.profile"
          v-bind:label="'Chunk Template'"
        >
          <template v-slot:description>
            Specify a template for the filenames in a chunkedhtml document. In
            the template, <code>%n</code> will be replaced by the chunk number
            (padded with leading 0s to 3 digits), <code>%s</code> with the
            section number of the chunk, <code>%h</code> with the heading text
            (with formatting removed), <code>%i</code> with the section
            identifier. For example, <code>%section-%s-%i.html</code> might be
            resolved to <code>section-1.1-introduction.html</code>. The
            characters <code>/</code> and <code>\</code> are not allowed in
            chunk templates and will be ignored. The default is
            <code>%s-%i.html</code>.
          </template>
        </SingleStringElement>

        <SingleStringElement
          v-bind:element="'epub-cover-image'"
          v-bind:profile="props.profile"
          v-bind:label="'Epub Cover Image'"
        >
          <template v-slot:description>
            Use the specified image as the EPUB cover. It is recommended that
            the image be less than 1000px in width and height. Note that in a
            Markdown source document you can also specify cover-image in a YAML
            metadata block (see EPUB Metadata, below).
          </template>
        </SingleStringElement>

        <CheckboxElement
          v-bind:checked="profile['epub-title-page'] === true"
          v-on:change="flipToggle('epub-title-page')"
          v-bind:label="'Epub Title Page'"
        >
          <template v-slot:description>
            Determines whether a the title page is included in the EPUB (default
            is true).
          </template>
        </CheckboxElement>

        <SingleStringElement
          v-bind:element="'epub-metadata'"
          v-bind:profile="props.profile"
          v-bind:label="'Epub Metadata file'"
        >
          <template v-slot:description>
            Look in the specified XML file for metadata for the EPUB. The file
            should contain a series of Dublin Core elements. For example:

            <pre><code>&lt;dc:rights&gt;Creative Commons&lt/dc:rights&gt;
&lt;dc:language&gt;es-AR&lt;/dc:language&gt;</code></pre>

            By default, pandoc will include the following metadata elements:
            <code>&lt;dc:title&gt;</code> (from the document title),
            <code>&lt;dc:creator&gt;</code> (from the document authors),
            <code>&lt;dc:date&gt;</code> (from the document date, which should
            be in ISO 8601 format), <code>&lt;dc:language&gt;</code> (from the
            lang variable, or, if is not set, the locale), and
            <code>&lt;dc:identifier id="BookId"&gt;</code> (a randomly generated
            UUID). Any of these may be overridden by elements in the metadata
            file.

            Note: if the source document is Markdown, a YAML metadata block in
            the document can be used instead. See below under EPUB Metadata.
          </template>
        </SingleStringElement>

        <MultiStringElement
          v-bind:label="'EPub fonts'"
          v-bind:element="'epub-fonts'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Embed the specified font in the EPUB. This option can be repeated to
            embed multiple fonts. Wildcards can also be used: for example,
            DejaVuSans-*.ttf. However, if you use wildcards on the command line,
            be sure to escape them or put the whole filename in single quotes,
            to prevent them from being interpreted by the shell. To use the
            embedded fonts, you will need to add declarations like the following
            to your CSS (see <code>--css</code>):
            <pre><code>@font-face {
  font-family: DejaVuSans;
  font-style: normal;
  font-weight: normal;
  src:url("../fonts/DejaVuSans-Regular.ttf");
}
body { font-family: "DejaVuSans"; }</code></pre>
          </template>
        </MultiStringElement>

        <SingleStringElement
          v-bind:element="'epub-subdirectory'"
          v-bind:profile="props.profile"
          v-bind:label="'Epub Subdirectory'"
        >
          <template v-slot:description>
            Specify the subdirectory in the OCF container that is to hold the
            EPUB-specific contents. The default is EPUB. To put the EPUB
            contents in the top level, use an empty string.
          </template>
        </SingleStringElement>

        <SelectElement
          v-bind:label="'Notebook Output'"
          v-bind:element="'ipynb-output'"
          v-bind:values="['all', 'none', 'best']"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Determines how ipynb output cells are treated. all means that all of
            the data formats included in the original are preserved. none means
            that the contents of data cells are omitted. best causes pandoc to
            try to pick the richest data block in each output cell that is
            compatible with the output format. The default is best.
          </template>
        </SelectElement>

        <SelectElement
          v-bind:label="'PDF Engine'"
          v-bind:element="'pdf-engine'"
          v-bind:values="[
            'pdflatex', 'lualatex', 'xelatex', 'latexmk', 'tectonic',
            'wkhtmltopdf', 'weasyprint', 'pagedjs-cli', 'prince', 'context',
            'pdfroff', 'typst'
          ]"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Use the specified engine when producing PDF output. Valid values are
            pdflatex, lualatex, xelatex, latexmk, tectonic, wkhtmltopdf,
            weasyprint, pagedjs-cli, prince, context, pdfroff, and typst. If the
            engine is not in your PATH, the full path of the engine may be
            specified here. If this option is not specified, pandoc uses the
            following defaults depending on the output format specified using
            <code>-t</code>/<code>--to</code>:
            <ul>
              <li>
                <code>-t latex</code> or none: pdflatex (other options: xelatex,
                lualatex, tectonic, latexmk)
              </li>
              <li><code>-t context</code>: context</li>
              <li>
                <code>-t html</code>: wkhtmltopdf (other options: prince,
                weasyprint, pagedjs-cli; see print-css.rocks for a good
                introduction to PDF generation from HTML/CSS)
              </li>
              <li><code>-t ms</code>: pdfroff</li>
              <li><code>-t typst</code>: typst</li>
            </ul>
          </template>
        </SelectElement>

        <MultiStringElement
          v-bind:label="'PDF Engine Options'"
          v-bind:element="'pdf-engine-opts'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Use the given strings as command-line arguments to the pdf-engine.
            For example, to use a persistent directory foo for latexmk's
            auxiliary files, use <code>--pdf-engine-opt=-outdir=foo</code>. Note
            that no check for duplicate options is done.
          </template>
        </MultiStringElement>
      </fieldset>

      <hr>

      <!-- CITATION RENDERING -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">Citation rendering</legend>

        <CheckboxElement
          v-bind:checked="profile.citeproc === true"
          v-on:change="flipToggle('citeproc')"
          v-bind:label="'Enable citeproc'"
        >
          <template v-slot:description>
            Process the citations in the file, replacing them with rendered
            citations and adding a bibliography. Citation processing will not
            take place unless bibliographic data is supplied, either through an
            external file specified using the <code>--bibliography</code> option
            or the bibliography field in metadata, or via a references section
            in metadata containing a list of citations in CSL YAML format with
            Markdown formatting. The style is controlled by a CSL stylesheet
            specified using the <code>--csl</code> option or the csl field in
            metadata. (If no stylesheet is specified, the chicago-author-date
            style will be used by default.) The citation processing
            transformation may be applied before or after filters or Lua filters
            (see <code>--filter</code>, <code>--lua-filter</code>): these
            transformations are applied in the order they appear on the command
            line. For more information, see the section on Citations.
          </template>
        </CheckboxElement>

        <MultiStringElement
          v-bind:label="'Bibliography'"
          v-bind:element="'bibliography'"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Set the bibliography field in the document's metadata to FILE,
            overriding any value set in the metadata. If you supply this
            argument multiple times, each FILE will be added to bibliography. If
            FILE is a URL, it will be fetched via HTTP. If FILE is not found
            relative to the working directory, it will be sought in the resource
            path (see <code>--resource-path</code>).
          </template>
        </MultiStringElement>

        <SingleStringElement
          v-bind:element="'csl'"
          v-bind:profile="props.profile"
          v-bind:label="'CSL File'"
        >
          <template v-slot:description>
            Set the csl field in the document's metadata to FILE, overriding any
            value set in the metadata. (This is equivalent to
            <code>--metadata csl=FILE</code>.) If FILE is a URL, it will be
            fetched via HTTP. If FILE is not found relative to the working
            directory, it will be sought in the resource path (see
            <code>--resource-path</code>) and finally in the csl subdirectory of
            the pandoc user data directory.
          </template>
        </SingleStringElement>

        <SingleStringElement
          v-bind:element="'citation-abbreviations'"
          v-bind:profile="props.profile"
          v-bind:label="'Citation Abbreviations'"
        >
          <template v-slot:description>
            Set the citation-abbreviations field in the document's metadata to
            FILE, overriding any value set in the metadata. (This is equivalent
            to <code>--metadata citation-abbreviations=FILE</code>.) If FILE is
            a URL, it will be fetched via HTTP. If FILE is not found relative to
            the working directory, it will be sought in the resource path (see
            <code>--resource-path</code>) and finally in the csl subdirectory of
            the pandoc user data directory.
          </template>
        </SingleStringElement>

        <SelectElement
          v-bind:label="'Cite method'"
          v-bind:element="'cite-method'"
          v-bind:values="['citeproc', 'natbib', 'biblatex']"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Use <strong>natbib</strong> for citations in LaTeX output. This
            option is not for use with the <code>--citeproc</code> option or
            with PDF output. It is intended for use in producing a LaTeX file
            that can be processed with bibtex.<br>
            <br>
            Use <strong>biblatex</strong> for citations in LaTeX output. This
            option is not for use with the <code>--citeproc</code> option or
            with PDF output. It is intended for use in producing a LaTeX file
            that can be processed with bibtex or biber.
          </template>
        </SelectElement>
      </fieldset>

      <hr>

      <!-- MATH RENDERING -->
      <fieldset class="uk-fieldset">
        <legend class="uk-legend">Math rendering in HTML</legend>
        <SelectElement
          v-bind:label="'HTML Math rendering'"
          v-bind:element="'html-math-method'"
          v-bind:values="[
            'mathjax', 'mathml', 'webtex', 'katex', 'gladtex', 'plain'
          ]"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Specifies how Math is rendered in HTML. Use <strong>MathJax</strong>
            to display embedded TeX math in HTML output. TeX math will be put
            between <code>\(...\)</code> (for inline math) or
            <code>\[...\]</code> (for display math) and wrapped in
            <code>&lt;span&gt;</code> tags with class math. Then the MathJax
            JavaScript will render it. A link to the Cloudflare CDN will be
            inserted.<br>
            <br>
            <strong>MathML</strong>: Convert TeX math to MathML (in epub3,
            docbook4, docbook5, jats, html4 and html5). This is the default in
            odt output. MathML is supported natively by the main web browsers
            and select e-book readers.<br>
            <br>
            <strong>webtex</strong>: Convert TeX formulas to
            <code>&lt;img&gt;</code> tags that link to an external script that
            converts formulas to images. The formula will be URL-encoded and
            concatenated with the URL provided. For SVG images you can for
            example use <code>--webtex https://latex.codecogs.com/svg.latex?</code>.
            If no URL is specified, the CodeCogs URL generating PNGs will be used
            (<a href="https://latex.codecogs.com/png.latex?" target="_blank">https://latex.codecogs.com/png.latex?</a>).
            Note: the <code>--webtex</code> option will affect Markdown output
            as well as HTML, which is useful if you're targeting a version of
            Markdown without native math support.<br>
            <br>
            Use <strong>KaTeX</strong> to display embedded TeX math in HTML
            output. The URL is the base URL for the KaTeX library. That
            directory should contain a katex.min.js and a katex.min.css file. If
            a URL is not provided, a link to the KaTeX CDN will be inserted.<br>
            <br>
            <strong>gladtex</strong>: Enclose TeX math in <code>&lt;eq&gt;</code>
            tags in HTML output. The resulting HTML can then be processed by
            GladTeX to produce SVG images of the typeset formulas and an HTML
            file with these images embedded.
            <pre><code>pandoc -s --gladtex input.md -o myfile.htex
gladtex -d image_dir myfile.htex
# produces myfile.html and images in image_dir</code></pre>
          </template>
        </SelectElement>
      </fieldset>

      <hr>

      <!-- MISCELLANEOUS -->
      <fieldset class="uk-fieldset uk-margin">
        <legend class="uk-legend">Miscellaneous</legend>
        <p>
          This section contains miscellaneous properties intended for logging or
          debugging purposes. You usually don't need these settings.
        </p>
        <CheckboxElement
          v-bind:checked="profile['dump-args'] === true"
          v-on:change="flipToggle('dump-args')"
          v-bind:label="'Dump arguments'"
        >
          <template v-slot:description>
            Print information about command-line arguments to stdout, then exit.
            This option is intended primarily for use in wrapper scripts. The
            first line of output contains the name of the output file specified
            with the <code>-o</code> option, or <code>-</code> (for stdout) if
            no output file was specified. The remaining lines contain the
            command-line arguments, one per line, in the order they appear.
            These do not include regular pandoc options and their arguments, but
            do include any options appearing after a <code>--</code> separator
            at the end of the line.
          </template>
        </CheckboxElement>

        <CheckboxElement
          v-bind:checked="profile['ignore-args'] === true"
          v-on:change="flipToggle('ignore-args')"
          v-bind:label="'Ignore arguments'"
        >
          <template v-slot:description>
            Ignore command-line arguments that are only relevant for wrapper-
            scripts, but not Pandoc. This will run Pandoc as if those have not
            been passed to the engine.
          </template>
        </CheckboxElement>

        <CheckboxElement
          v-bind:checked="profile['fail-if-warnings'] === true"
          v-on:change="flipToggle('fail-if-warnings')"
          v-bind:label="'Fail on warnings'"
        >
          <template v-slot:description>
            Exit with error status if there are any warnings.
          </template>
        </CheckboxElement>

        <CheckboxElement
          v-bind:checked="profile.trace === true"
          v-on:change="flipToggle('trace')"
          v-bind:label="'Print tracing parser progress'"
        >
          <template v-slot:description>
            Print diagnostic output tracing parser progress to stderr. This
            option is intended for use by developers in diagnosing performance
            issues.
          </template>
        </CheckboxElement>

        <SingleStringElement
          v-bind:element="'log-file'"
          v-bind:profile="props.profile"
          v-bind:label="'Log file'"
        >
          <template v-slot:description>
            Write log messages in machine-readable JSON format to FILE. All
            messages above DEBUG level will be written, regardless of verbosity
            settings (<code>--verbose</code>, <code>--quiet</code>).
          </template>
        </SingleStringElement>

        <SelectElement
          v-bind:label="'Verbosity'"
          v-bind:element="'verbosity'"
          v-bind:values="['INFO', 'WARNING', 'ERROR']"
          v-bind:profile="props.profile"
        >
          <template v-slot:description>
            Specifies the verbosity level of pandoc. The default verbosity level
            is "WARNING". "INFO" corresponds to <code>--verbose</code> and
            "ERROR" corresponds to <code>--quiet</code>.
          </template>
        </SelectElement>
      </fieldset>
    </form>
  </div>

  <button
    class="uk-button uk-button-danger uk-button-large"
    id="close-button"
    v-on:click.prevent="closeProfile()"
  >
    Close
    <span uk-icon="close"></span>
  </button>

  <div v-if="appStore.currentProfile !== undefined" id="download-button" class="uk-button-group">
    <button
      class="uk-button uk-button-primary uk-button-large"
      v-on:click.prevent="exportDefaults(appStore.currentProfileName, appStore.currentProfile)"
    >
      Download profile
      <span uk-icon="cloud-download"></span>
    </button>
    <button class="uk-button uk-button-primary" title="Copy to clipboard" v-on:click="copyToClipboard">
      <span uk-icon="copy"></span>
    </button>
  </div>
</template>

<script setup lang="ts">
import PandocReaderWriter from 'src/form-elements/PandocReaderWriter.vue'
import PrimaryButton from 'src/form-elements/PrimaryButton.vue'
import CheckboxElement from 'src/form-elements/CheckboxElement.vue'
import SelectElement from 'src/form-elements/SelectElement.vue'
import SingleStringElement from 'src/form-elements/SingleStringElement.vue'
import MultiStringElement from 'src/form-elements/MultiStringElement.vue'
import NumberElement from 'src/form-elements/NumberElement.vue'
import RecordElement from 'src/form-elements/RecordElement.vue'
import FilterElement from 'src/form-elements/FilterElement.vue'
import { InternalDefaults, pandocReaders, pandocWriters } from 'src/pandoc-defaults'
import { useAppStore } from 'src/pinia'
import { exportDefaults, internalDefaultsToYAML } from 'src/pandoc-transformer'

const props = defineProps<{ profile: Partial<InternalDefaults> }>()
const appStore = useAppStore()
const { updateCurrentProfile, closeProfile } = appStore

/**
 * Instead of allowing true/false values, Pandoc treats toggles as true/undefined.
 * This helper function makes this simpler for the litany of toggles.
 *
 * @param  {keyof InternalDefaults}  which  The toggle to switch
 */
function flipToggle (which: keyof InternalDefaults) {
  if (props.profile[which] === true) {
    updateCurrentProfile({ [which]: undefined })
  } else {
    updateCurrentProfile({ [which]: true })
  }
}

function copyToClipboard () {
  if (appStore.currentProfile === undefined) {
    return
  }

  const yaml = internalDefaultsToYAML(appStore.currentProfile)
  navigator.clipboard.writeText(yaml)
}
</script>

<style>
#download-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
}

#close-button {
  position: fixed;
  top:10px;
  right: 10px;
}
</style>
