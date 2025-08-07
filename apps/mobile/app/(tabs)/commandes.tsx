import { TailwindView, TailwindText } from '../../components/ui';
import { themeClasses } from '../../hooks/useTailwindTheme';

export default function CommandesScreen() {
  return (
    <TailwindView className={`${themeClasses.background} flex-1 p-4`}>
      <TailwindView className="flex-1 justify-center items-center">
        <TailwindText className={`${themeClasses.text} text-2xl font-bold`}>
          Page : Commandes
        </TailwindText>
      </TailwindView>
    </TailwindView>
  );
}
