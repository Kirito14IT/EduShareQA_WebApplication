package com.edushareqa;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.FactoryBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@MapperScan("com.edushareqa.mapper")
public class EduShareQaApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(EduShareQaApplication.class);
        app.addInitializers(new FactoryBeanTypeInspector());
        app.run(args);
    }

    /**
     * 在容器刷新前检查 BeanDefinition 中的 FactoryBean 类型标记，帮助定位 factoryBeanObjectType 异常。
     */
    static class FactoryBeanTypeInspector implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        private static final Logger log = LoggerFactory.getLogger(FactoryBeanTypeInspector.class);

        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            ConfigurableListableBeanFactory beanFactory = applicationContext.getBeanFactory();
            for (String name : beanFactory.getBeanDefinitionNames()) {
                BeanDefinition bd = beanFactory.getBeanDefinition(name);
                Object attr = bd.getAttribute(FactoryBean.OBJECT_TYPE_ATTRIBUTE);
                if (attr != null && !(attr instanceof Class)) {
                    log.error("FactoryBean OBJECT_TYPE_ATTRIBUTE 非 Class 类型: bean={}, attributeType={}, value={}",
                            name, attr.getClass().getName(), attr);
                }
            }
        }
    }
}

