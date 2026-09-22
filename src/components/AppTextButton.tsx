import { DSButton, type DSButtonProps } from '../design-system/primitives/Button/DSButton'
import './AppTextButton.css'
/** Platform management action. Project resource actions continue using their own DS theme. */
export function AppTextButton({className='',...props}:Omit<DSButtonProps,'variant'|'semantic'|'icon'|'iconPosition'>){
 return <DSButton {...props} variant="tertiary" semantic="default" className={`app-text-action ${className}`}/>
}
