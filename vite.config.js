import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                class9: resolve(__dirname, 'class9.html'),
                class10: resolve(__dirname, 'class10.html'),
                class11: resolve(__dirname, 'class11.html'),
                class12: resolve(__dirname, 'class12.html'),
                search: resolve(__dirname, 'search.html'),
                admin: resolve(__dirname, 'admin.html'),
                'article-celldivision-level1': resolve(__dirname, 'article-celldivision-level1.html'),
                'article-celldivision-level2': resolve(__dirname, 'article-celldivision-level2.html'),
                'article-celldivision-level3': resolve(__dirname, 'article-celldivision-level3.html'),
                'article-celldivision-level4': resolve(__dirname, 'article-celldivision-level4.html'),
                'article-class10-control': resolve(__dirname, 'article-class10-control.html'),
                'article-class10-environment': resolve(__dirname, 'article-class10-environment.html'),
                'article-class10-heredity': resolve(__dirname, 'article-class10-heredity.html'),
                'article-class10-life-processes': resolve(__dirname, 'article-class10-life-processes.html'),
                'article-class10-reproduction': resolve(__dirname, 'article-class10-reproduction.html'),
                'article-class11-biomolecules': resolve(__dirname, 'article-class11-biomolecules.html'),
                'article-class11-breathing': resolve(__dirname, 'article-class11-breathing.html'),
                'article-class11-classification': resolve(__dirname, 'article-class11-classification.html'),
                'article-class11-fluids': resolve(__dirname, 'article-class11-fluids.html'),
                'article-class11-morphology': resolve(__dirname, 'article-class11-morphology.html'),
                'article-class12-biodiversity': resolve(__dirname, 'article-class12-biodiversity.html'),
                'article-class12-biotech': resolve(__dirname, 'article-class12-biotech.html'),
                'article-class12-genetics': resolve(__dirname, 'article-class12-genetics.html'),
                'article-class12-health': resolve(__dirname, 'article-class12-health.html'),
                'article-class12-reproduction': resolve(__dirname, 'article-class12-reproduction.html'),
                'article-class9-food': resolve(__dirname, 'article-class9-food.html'),
                'article-class9-illness': resolve(__dirname, 'article-class9-illness.html'),
                'article-class9-resources': resolve(__dirname, 'article-class9-resources.html'),
                'article-class9-tissues': resolve(__dirname, 'article-class9-tissues.html'),
                'article-class9-unit-life': resolve(__dirname, 'article-class9-unit-life.html'),
                'article-mitosis': resolve(__dirname, 'article-mitosis.html'),
                'article-photosynthesis-level1': resolve(__dirname, 'article-photosynthesis-level1.html'),
                'article-photosynthesis-level2': resolve(__dirname, 'article-photosynthesis-level2.html'),
                'article-photosynthesis-level3': resolve(__dirname, 'article-photosynthesis-level3.html'),
                'article-photosynthesis-level4': resolve(__dirname, 'article-photosynthesis-level4.html'),
                'article-tips': resolve(__dirname, 'article-tips.html'),
            }
        }
    }
})
