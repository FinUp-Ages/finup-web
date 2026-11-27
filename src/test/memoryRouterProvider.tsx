/**
 * Troca o data router do navegador por um MemoryRouter com as mesmas rotas, para testar a
 * arvore real de app/routes.
 *
 * Por que: no jsdom com Node 24, o createBrowserRouter cria um Request do undici com o
 * AbortSignal do jsdom, e o undici recusa ("Expected signal to be an instance of
 * AbortSignal"). As rotas, guardas e layouts continuam os de producao.
 *
 * Uso: vi.mock('react-router-dom', async (importOriginal) =>
 *   (await import('@/test/memoryRouterProvider')).withMemoryRouter(await importOriginal()));
 */
import type { RouteObject } from 'react-router-dom';

type ReactRouterDom = typeof import('react-router-dom');

export function withMemoryRouter(rr: ReactRouterDom): ReactRouterDom {
  function LocationProbe() {
    const location = rr.useLocation();
    return <output data-testid="location">{location.pathname}</output>;
  }

  function Routes({ routes }: { routes: RouteObject[] }) {
    return rr.useRoutes(routes);
  }

  function RouterProvider({ router }: { router: unknown }) {
    return (
      <rr.MemoryRouter initialEntries={[window.location.pathname]}>
        <Routes routes={router as RouteObject[]} />
        <LocationProbe />
      </rr.MemoryRouter>
    );
  }

  return {
    ...rr,
    createBrowserRouter: ((routes: RouteObject[]) =>
      routes) as unknown as ReactRouterDom['createBrowserRouter'],
    RouterProvider: RouterProvider as unknown as ReactRouterDom['RouterProvider'],
  };
}
