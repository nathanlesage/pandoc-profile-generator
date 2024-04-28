# Pandoc Profile Generator

> A small graphical application to create and modify Pandoc defaults files. [Launch the app by following this link](https://nathanlesage.github.io/pandoc-profile-generator).

Pandoc is a powerful platform that can transform many file formats from one into the other. However, this power comes at a cost: Pandoc can be difficult to configure. I developed the Pandoc Profile Generator as a visual aid to understand the multitude of options that are available, and quickly create files for all your needs.

There are three main reasons for using the generator to draft defaults files:

1. **At a glance**: It represents the complex reader/writer structure with the various extensions in an ergonomic way to make it simple to see at a glance which extensions are enabled, and which ones are even available for a given reader or writer.
2. **No-Code Solution**: It wraps the process of writing YAML code into a form with predefined options to ensure that the resulting YAML file will work with Pandoc.
3. **Never forget a setting again**: It re-arranges the relevant pieces of the documentation next to fields that allow you to immediately use an option, if you need it.

> [!NOTE]
> The Profile Generator is meant as an aid, and due to the complexity of Pandoc's configuration, there are a few caveats (see below). What it supplies should work, but remember that the authoritative document is always the [Pandoc User Manual](https://pandoc.org/MANUAL.html), and you can always modify the files after the fact.

## Getting Started

> [!NOTE]
> This guide uses the terms "profile" and "defaults file" interchangeably. Both refer to the YAML configuration files that you can pass to pandoc with `--defaults-file="file.yml"`

To use the Pandoc Profile Generator, simply [head over to the website](https://nathanlesage.github.io/pandoc-profile-generator). You will be greeted by a welcome screen that gives you essentially three options to choose from, depending on your current needs:

1. Drag and drop an existing Pandoc profile (which is a YAML file) from your file browser into the dropzone. The app read in the file's contents, parse them, and open them in the editor.
2. Should it be easier for you to simply copy and paste some settings (for example, from [Zettlr's](https://github.com/Zettlr/Zettlr) assets manager), select your YAML code, copy it to your clipboard, and paste it somewhere into the app. It will read the contents from your clipboard, parse them, and open them in the editor.
3. Press the "Create new file" button to create a new file from scratch.

## The Editor

Once you're in the editor view, you can configure every Pandoc option graphically. The editor itself has a few UX elements worth explaining:

* The "Close" button in the top-right corner closes the current file and returns you to the welcome screen. Your changes are persisted in the LocalStorage (more below) so that you can pick up working later again.
* The "Download profile" button will download the file to your computer (according to your browser's settings).
* Next to the "Download profile" button is a smaller one that will simply copy the YAML contents into your clipboard so that you can then paste them again (for example back into Zettlr's assets manager).
* At the top, there is an input field that allows you to give your file a name. This is mainly for aesthetic reasons, but giving your file a descriptive name will help.
* To the right of each option (below if you're on mobile or the window is very narrow) there is a description of what an option does. Most of this is copied directly from the Pandoc manual, but sometimes there are changes to reflect how the generator will treat values (since Pandoc mostly focuses on the command line, not on the defaults files).

## Adding and Removing Options

For Pandoc, every option is entirely optional, which means that only those options will show as active that are defined in your YAML file (which is none, if you chose to create an empty new file).

To add a field/option to your file, click the corresponding button. This will then hide the add-button and instead render the interface for manipulating this option.

To remove an option (which is different from simply leaving the field empty!), click the trash can. **Attention: This will irreversibly delete all changes you've made to the field.**

## Modifying Options

There are essentially seven kinds of options:

1. Simple on/off properties, which are represented by checkboxes
2. Single string properties which allow you to specify a single string value (e.g., paths to files on your computer)
3. Multi-string properties which allow you to specify multiple values
4. Number properties which allow you to specify a numeric value
5. Select properties which allow you to choose from a predefined set of options
6. Record properties which allow you to set key-value pairs
7. A small number of special fields that have special properties

> [!TIP]
> The string and number properties accept anything that looks like a string/number. Make sure to read the description to pass a value that makes sense in the given context. The generator doesn't prevent you from entering values that may be valid but nonsensical.

### Specifying a Reader and a Writer

Two special fields are the reader and writer properties. They both work analogous. After adding either of them, you will see a big amount of options turning up.

The first decision pertains to which reader/writer you would like to choose. Pandoc ships with many built-in readers and writers, but you can also choose a custom one. You can switch between custom and built-in readers/writers using the corresponding button.

When you choose a built-in reader/writer, you can enable or disable various extensions. I have searched the documentation to (hopefully) find all combinations of readers, writers, and extensions. Some readers/writers only support a few (e.g., the docx-reader), but some support quite many (e.g., the various Markdown-readers). The checkboxes next to the extension names represent whether the given extension is currently enabled. When changing selections, it will load the default values, e.g., enable those checkboxes whose extensions are enabled by default, and disabling available but disabled ones. The app only records the changes you make from the defaults (to keep the resulting reader-string as simple as possible). That means: If you select, say, the markdown reader and disable the "Fenced Code Attributes" extension, the resulting reader property will only show `markdown-fenced_code_attributes`, despite having many active checkboxes.

To learn more about an extension, hover with your mouse over (or tap, if you're on mobile) the question mark icons next to the extensions, which will show you a summary of what they do. Note that the Pandoc manual oftentimes includes more information and even examples, so refer to it in case of questions.

## Persistence, Privacy and LocalStorage

The app will make use of your browser's LocalStorage for persistence. LocalStorage is a feature of your web browser that will let websites store small amounts of data **on your own computer** that stay there even if you close the website and the web browser. The generator makes use of this, since it means that there is no web server involved -- **all data remains on your computer** and never leaves it (even though it's a web-app!).

Any file that you've edited in the past will show up on the welcome screen's "Recent files" section, from which you can either directly download it, open it for editing, or remove it.

However, **note that LocalStorage is only semi-persistent**. There are many things that can make data from the LocalStorage disappear: cleaning the website data or your browser cache (which may be automatic after some time, depending on your settings), not visiting the page in a long time, or other variables that the app cannot influence.

Therefore, do not rely on the storage to actually keep your files persistent. It is meant only as a convenience function: If a file you want to change is still in the list of recent files, that means that you don't have to upload it again.

> [!WARNING]
> The filenames you choose are unique for the list of recent files. That means: Files with the same name will override older ones. I did not make too many efforts for proper file management, as the LocalStorage persistence is, as indicated, merely a convenience feature and not an integral feature. Always download files you intend to use.

## Caveats

When I set out to build this app, I expected it to take a few hours at most. It turned out to be much longer, which has to do with the complexity of the configuration. There are dozens of options you can set, and some of them require others to be present, and others won't work when certain options are set.

To keep the complexity of the generator itself (and thus the maintenance) low, the generator cuts sometimes corners to make it simpler:

* There are some options that accept both a singular option for a single value, or a pluralized option for multiple ones (e.g., `metadata-file` vs. `metadata-files`). I couldn't be bothered implementing both, so the generator will always export the pluralized option, even if it only contains a single value. (The app will properly parse the singular options, however, so no worries)
* **Comments aren't retained**, so if you added some to explain certain values, those will not be persisted in the export!
* Some complex configurations are not represented by the app. For example, the math rendering option is a simple dropdown list, even though you can fine tune it more. The same applies to the filters field.
* The internal data structure is simpler than the original Pandoc configuration because the app has to parse the options into an efficient data structure for constant modification. It will only transform the internal representation into a Pandoc-compatible one on export. This means that there may be edge cases that I didn't implement.
* The app does not implement mechanisms to enable/disable options conditionally on other ones. This is (a) to keep the complexity low, but (b) also to keep the app more flexible (because what options work with which other one may change quickly).
* The Pandoc documentation has naturally amassed some inconsistencies over the long time that the document has been maintained. I tried to figure out which information is correct, but there may be a few cases in which I made the wrong call. I'm happy for PRs fixing that!
* I may have literally just misunderstood parts of the documentation. If there are any obvious errors in the editor, please file a bug report or, even better, submit a Pull Request.
* This entire project is essentially a data-dump of the Pandoc manual, which means that it likely goes out of date pretty quickly. I hope that, if you find this generator useful, you will help keep it up to date in the future!
* Since the app doesn't require a web server, you should be able to literally download the HTML and JS files to your computer and run it locally. But I didn't test this, so your mileage may vary.

## Contributing

This is a hobby project started and finished in a single weekend. I did it to solve a problem that I had, but I believe it will be useful for others, too.

Since my time and energy is limited, I welcome Pull Requests that directly fix issues, but if you don't know how to start, opening an issue alerting the community of issues is just as valuable.

To contribute code, here's a quick rundown of the stack:

* It's a Node project with Yarn as the package manager
* It is entirely written in TypeScript
* The framework is Vue.js 3 (exclusively script-setup API)
* The UI framework is UIkit.
* The app is bundled using webpack.

I tried to keep the (potentially changing) parts of the Pandoc configuration concentrated in three files:

* `pandoc-defaults.ts` contains the configuration interface and describes what options Pandoc (and the generator) will accept. The documentation for the extensions is also contained here.
* `pandoc-transformer.ts` contains code to convert between YAML and the internal data structure
* `screens/EditorScreen.vue` contains the editor form, which includes the copied & pasted parts of the Pandoc documentation next to the configuration options.

Lastly, the `form-elements` subdirectory contains Vue components for each type of field that Pandoc accepts.

> [!NOTE]
> By contributing to the repository by opening a Pull Request, you agree that your code will also be released under the GNU GPL 3.0 license.

## License

The code for the Pandoc Profile Generator is licensed via GNU GPL 3.0. See the LICENSE file for more information.
