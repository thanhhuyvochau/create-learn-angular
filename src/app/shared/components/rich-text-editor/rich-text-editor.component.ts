import {
  Component,
  OnInit,
  OnDestroy,
  input,
  output,
  signal,
  effect,
  inject,
  forwardRef,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [NgxEditorModule, FormsModule, MatFormFieldModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="editor-wrapper" [class.disabled]="disabled()" [class.has-error]="!!error()">
      @if (label()) {
        <label class="editor-label">
          {{ label() }}
          @if (required()) {
            <span class="required-asterisk">*</span>
          }
        </label>
      }

      <div class="editor-container">
        <ngx-editor-menu [editor]="editor" [toolbar]="toolbar"></ngx-editor-menu>
        <ngx-editor
          [editor]="editor"
          [ngModel]="content()"
          (ngModelChange)="onContentChange($event)"
          [disabled]="disabled()"
          [placeholder]="placeholder()"
        ></ngx-editor>
      </div>

      @if (error()) {
        <div class="error-message">{{ error() }}</div>
      }
      @if (hint() && !error()) {
        <div class="hint-message">{{ hint() }}</div>
      }
    </div>
  `,
  styles: [
    `
      .editor-wrapper {
        width: 100%;
      }

      .editor-label {
        display: block;
        margin-bottom: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }

      .required-asterisk {
        color: #f44336;
        margin-left: 2px;
      }

      .editor-container {
        border: 1px solid rgba(0, 0, 0, 0.23);
        border-radius: 4px;
        overflow: hidden;
        transition: border-color 0.2s;
      }

      .editor-container:hover {
        border-color: rgba(0, 0, 0, 0.87);
      }

      .editor-container:focus-within {
        border-color: #3f51b5;
        border-width: 2px;
      }

      .has-error .editor-container {
        border-color: #f44336;
      }

      .disabled .editor-container {
        background-color: rgba(0, 0, 0, 0.04);
        pointer-events: none;
        opacity: 0.6;
      }

      :host ::ng-deep .NgxEditor {
        min-height: 200px;
        padding: 12px;
      }

      :host ::ng-deep .NgxEditor__Content {
        min-height: 160px;
      }

      :host ::ng-deep .NgxEditor__MenuBar {
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        padding: 4px 8px;
        background-color: #fafafa;
      }

      .error-message {
        margin-top: 4px;
        font-size: 0.75rem;
        color: #f44336;
      }

      .hint-message {
        margin-top: 4px;
        font-size: 0.75rem;
        color: rgba(0, 0, 0, 0.6);
      }
    `,
  ],
})
export class RichTextEditorComponent
  implements OnInit, OnDestroy, OnChanges, ControlValueAccessor
{
  // Inputs
  label = input<string>('');
  placeholder = input<string>('Write content here...');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  error = input<string | null>(null);
  hint = input<string>('');
  minHeight = input<number>(200);
  
  // Content input for standalone usage (not with formControl)
  initialContent = input<string>('', { alias: 'content' });
  
  // Output for content changes (for standalone usage)
  contentChange = output<string>();

  // Internal state
  content = signal<string>('');
  editor!: Editor;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['undo', 'redo'],
  ];

  // ControlValueAccessor
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.editor = new Editor();
    // Set initial content from input if provided
    if (this.initialContent()) {
      this.content.set(this.initialContent());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle content input changes for standalone usage
    if ('initialContent' in changes && !changes['initialContent'].firstChange) {
      this.content.set(this.initialContent());
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  onContentChange(html: string): void {
    this.content.set(html);
    this.onChange(html);
    this.onTouched();
    // Emit for standalone usage
    this.contentChange.emit(html);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.content.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handled via input signal
  }
}
