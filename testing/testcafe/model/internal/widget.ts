import { Selector, ClientFunction } from 'testcafe';

const CLASS = {
  focused: 'dx-state-focused',
  hovered: 'dx-state-hover',
};

export default abstract class Widget {
  public element: Selector;

  public isFocused: Promise<boolean>;

  public isHovered: Promise<boolean>;

  abstract name: string;

  constructor(id: string | Selector) {
    this.element = typeof id === 'string' ? Selector(id) : id;
    this.isFocused = this.element.hasClass(CLASS.focused);
    this.isHovered = this.element.hasClass(CLASS.hovered);
  }

  static addClassPrefix(widgetName: string, className: string): string {
    return `dx-${widgetName.slice(2).toLowerCase() + (className ? `-${className}` : '')}`;
  }

  option(option: string, value?: unknown): Promise<any> {
    const { element, name } = this;
    const get = (): any => $(element())[name]('instance').option(option);
    const set = (): any => $(element())[name]('instance').option(option, value);
    const isSetter = arguments.length === 2;

    return ClientFunction(isSetter ? set : get, {
      dependencies: {
        option, value, element, name,
      },
    })();
  }
}
