# Pandoc Profile Generator

> A small graphical application to create and modify Pandoc defaults files.

Pandoc is a powerful platform that can transform many file formats from one into the other. However, this power comes at a cost: Pandoc can be difficult to configure.

I developed the Pandoc Profile Generator as a visual aid to understand the
multitude of options that are available. Specifically, there are three things that may make the generator a good choice for drafting defaults files:

1. It represents the complex reader/writer structure with the various extensions in an ergonomic way to make it simple to see at a glance which extensions are enabled, and which ones are even available for a given reader or writer.
2. It restricts you only a little to ensure that the resulting YAML file will work with Pandoc.
3. It re-arranges the relevant pieces of the documentation so that it is easy to scroll through the list and see quickly, whether a given option may be useful.

> [!NOTE]
> The Profile Generator is meant as an aid, and due to the complexity of Pandoc's configuration, there are a few caveats (see below). What it supplies should work, but remember that the authoritative document is always the [Pandoc User Manual](https://pandoc.org/MANUAL.html).

## Getting Started

> [!NOTE]
> This guide uses the terms "profile" and "defaults file" interchangeably. Both refer to the YAML configuration files that you can pass to pandoc with `--defaults-file="file.yml"`

To use the Pandoc Profile Generator, simply head over to the website. You will be greeted by a welcome screen that gives you essentially three options to choose from, depending on your current needs:

1. You can drag and drop an existing Pandoc profile (which is a YAML file) into the dropzone. This will make the app read in the file's contents, parse them, and open them in the editor.
2. Should it be easier for you to simply copy and paste a defaults file, select your entire YAML file, copy it to your clipboard, and paste it somewhere into the app. It will read the contents from your clipboard, parse them, and open them in the editor.
3. Press the "Create new file" button to create a new file from scratch.

## The Editor

Once you're in the editor view, you can configure every Pandoc option graphically. The editor itself has a few UX elements worth explaining:

* The "Close" button in the top-right corner closes the current file and returns you to the welcome screen. Your changes are persisted in the LocalStorage (more below) so that you can pick up working later again.
* The "Download profile" button will download the file to your computer (according to your browser's settings).
* Next to the "Download profile" button is a smaller one that will simply copy the YAML contents into your clipboard so that you can then paste them again.
* At the top, there is an input field that allows you to give your file a name. This is mainly for aesthetic reasons, but giving your file a descriptive name will help.
* Besides each option (below if you're on mobile or the window is very narrow) there is a description of what an option does. Most of this is copied directly from the Pandoc manual, but sometimes there are changes to reflect how the generator will treat values (since Pandoc mostly focuses on the command line, not on the defaults files).

## Adding and Removing Options

For Pandoc, every option is entirely optional, which means that only those options will show as active that are defined in your YAML file (which is none, if you chose to create an empty new file).

To add an option to your file, click the corresponding button. This will then hide the add-button and instead render the interface for manipulating this option.

To remove an option (which is different from simply leaving the field empty!), click the trash can. **Attention: This will delete all changes you've made to the field.**

## Modifying Options

There are essentially seven kinds of options:

1. Simple on/off properties, which are represented by checkboxes
2. Single string properties which allow you to specify a single string value
3. Multi-string properties which allow you to specify multiple values
4. Number properties which allow you to specify a numeric value
5. Select properties which allow you to choose from a predefined set of options
6. Record properties which allow you to set key-value pairs
7. A small number of special fields that have special properties

> [!TIP]
> The string and number properties accept various types of values. Make sure to read the description to pass a path to a file where appropriate, and specific values otherwise. The generator doesn't prevent you from entering values that may be valid strings but are nonsensical in the specific context.

### Specifying a Reader and a Writer

Two special fields are the reader and writer properties. They both work analogous. After adding either of them, you will see a big amount of options turning up.

The first decision pertains to which reader/writer you would like to choose. Pandoc ships with many built-in readers and writers, but depending on your use-case you may have a custom one. You can switch between custom and built-in readers/writers using the corresponding button.

When you choose a built-in reader/writer, you can additionally enable or disable various extensions. Some readers/writers only support a few, but some support quite many. The checkboxes next to the extension names represent whether the given extension is currently enabled.

Some extensions are enabled by default, but you can explicitly disable them. Likewise, you can enable extensions that are disabled by default. Upon export, the generator will construct a reader/writer string that contains the minimal viable string to use the reader/writer in your chosen configuration. That means: If you select, say, the markdown reader and disable the "Fenced Code Attributes" extension, the resulting reader property will only show `markdown-fenced_code_attributes`, despite having many active checkboxes.

To learn more, hover with your mouse over the question mark icons next to the extensions, which will show you a summary of what they do. Note that the Pandoc manual oftentimes includes more information and even examples, so refer to it in case of questions.

## Persistence and LocalStorage

The app will make use of your browser's LocalStorage for persistence. LocalStorage is a feature of your web browser that will let websites store small amounts of data on your own computer that stay there even if you close the website and the web browser. The generator makes use of this, since it means that there is no web server involved -- all data remains on your computer.

Any file that you've edited in the past will show up on the welcome screen, from which you can either directly download it, open it for editing, or remove it.

However, note that LocalStorage is only semi-persistent. There are many things that can make data from the LocalStorage disappear: cleaning the website data or your browser cache, not visiting the page in a long time, or other variables that the app cannot influence.

Therefore, do not rely on the storage to actually keep your files persistent. **The data remains on your computer and is never transferred to some server.** It is meant as a convenience function: If a file you want to change is still in the list of recent files, that means that you don't have to upload it again.

> [!WARNING]
> While the names are unique in that new files which you upload will overwrite those with the same names, I did not make too much efforts for proper file management, as the LocalStorage persistence is, as indicated, merely a convenience feature. Always download files you intend to use.

## Caveats

When I set out to build this app, I expected it to take a few hours at most. It turned out to be much longer, which has to do with the complexity of the configuration. There are dozens of options you can set, and some of them require others to be present, and others won't work when certain options are set.

To keep the complexity of the generator itself (and thus the maintenance) low, the generator cuts sometimes corners to make it simpler:

* Some complex configurations are not represented by the app. For example, the math rendering option is a simple dropdown list, even though you can fine tune it more.
* The internal data structure is simpler than the original Pandoc configuration because the app has to parse the options into an efficient data structure for constant modification. It will only transform the internal representation into a Pandoc-compatible one on export. This means that there may be edge cases that I didn't implement.
* The app does not implement mechanisms to enable/disable options conditionally on other ones. This is (a) to keep the complexity low, but (b) also to keep the app more flexible. You will need to read the descriptions to ensure you use combinations of options that make sense.
* The Pandoc documentation has naturally amassed some inconsistencies over the long time that the document has been maintained. I tried to figure out which information is correct, but there may be a few cases in which I made a wrong call.
* I may have literally just misunderstood parts of the documentation. If there are any obvious errors in the editor, please file a bug report or, even better, submit a Pull Request.
* This entire project is essentially a data-dump of the Pandoc manual, which means that it likely goes out of date pretty quickly. I hope that, if you find this generator useful, you will help keep it up to date in the future!
* Since the app doesn't require a web server, you should be able to literally download the HTML file to your computer and run it locally. But I didn't test this, so your mileage may vary.

## Contributing

This is a hobby project from a single weekend. I did it to solve a problem that I had, but I believe it will be useful for others, too.

Since my time and energy is limited, I welcome Pull Requests that directly fix issues, but if you don't know how to start, opening an issue alerting the community of the fact is just as valuable.

To contribute code, here's a quick rundown of the stack:

* It's a Node project with Yarn as the package manager
* It is entirely written in TypeScript
* The framework is Vue.js 3 (exclusively script-setup API)
* The UI framework is UIkit.
* The app is bundled using webpack.

I tried to keep the (potentially changing) parts of the Pandoc configuration concentrated in three files:

* `pandoc-defaults.ts` contains the configuration interface and describes what options Pandoc will accept
* `pandoc-transformer.ts` contains code to convert from YAML to the internal data structure and back
* `screens/EditorScreen.vue` contains the editor form.

## License

The code for the Pandoc Profile Generator is licensed via GNU GPL 3.0.
