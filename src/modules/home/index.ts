import type { AppModule } from '@/shared/types/module';
import { homePublicRoutes } from './routes';

// The staff shell reuses the public site's header controls (CS-02: app/ imports a module via its index).
export { LanguagePicker } from './components/LanguagePicker';
export { LocationPicker } from './components/LocationPicker';
export { HireLanguageProvider } from './layout/HireLanguageProvider';
export { HomeStateProvider } from './layout/HomeStateProvider';

export const homeModule: AppModule = {
  id: 'home',
  nav: [],
  routes: [],
  publicRoutes: homePublicRoutes
};
